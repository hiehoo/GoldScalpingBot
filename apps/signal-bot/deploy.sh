#!/bin/bash

# Mzansi FX VIP Signal Bot - Deployment Script
# Usage: ./deploy.sh [command]
# Commands: setup, start, stop, restart, logs, status

set -e

CONTAINER_NAME="mzansi-signal-bot"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() { echo -e "${GREEN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Installing..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo usermod -aG docker $USER
        rm get-docker.sh
        log "Docker installed. Please log out and back in, then run this script again."
        exit 1
    fi
}

# Check if docker-compose is available
check_compose() {
    if ! docker compose version &> /dev/null; then
        error "Docker Compose is not available"
        exit 1
    fi
}

# Setup environment
setup() {
    log "Setting up Mzansi FX VIP Signal Bot..."

    # Check for .env file
    if [ ! -f .env ]; then
        if [ -f .env.example ]; then
            cp .env.example .env
            warn "Created .env from .env.example"
            warn "Please edit .env with your actual credentials:"
            echo "  nano .env"
            exit 1
        else
            error ".env file not found. Create it with:"
            echo "  TELEGRAM_BOT_TOKEN=your_token"
            echo "  TELEGRAM_CHANNEL_ID=@YourChannel"
            echo "  TWELVE_DATA_API_KEY=your_api_key"
            exit 1
        fi
    fi

    log "Building Docker image..."
    docker compose build

    log "Setup complete! Run: ./deploy.sh start"
}

# Start the bot
start() {
    log "Starting Signal Bot..."
    docker compose up -d
    log "Bot started! Check logs: ./deploy.sh logs"
}

# Stop the bot
stop() {
    log "Stopping Signal Bot..."
    docker compose down
    log "Bot stopped."
}

# Restart the bot
restart() {
    log "Restarting Signal Bot..."
    docker compose restart
    log "Bot restarted!"
}

# View logs
logs() {
    docker compose logs -f --tail=100
}

# Check status
status() {
    echo ""
    log "Container Status:"
    docker compose ps
    echo ""
    log "Recent Logs:"
    docker compose logs --tail=20
}

# Update and restart
update() {
    log "Pulling latest changes..."
    git pull origin main

    log "Rebuilding container..."
    docker compose build --no-cache

    log "Restarting bot..."
    docker compose up -d

    log "Update complete!"
}

# Main
check_docker
check_compose

case "${1:-}" in
    setup)
        setup
        ;;
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    logs)
        logs
        ;;
    status)
        status
        ;;
    update)
        update
        ;;
    *)
        echo "Mzansi FX VIP Signal Bot - Deployment Script"
        echo ""
        echo "Usage: ./deploy.sh [command]"
        echo ""
        echo "Commands:"
        echo "  setup    - Initial setup (build image)"
        echo "  start    - Start the bot"
        echo "  stop     - Stop the bot"
        echo "  restart  - Restart the bot"
        echo "  logs     - View live logs"
        echo "  status   - Check bot status"
        echo "  update   - Pull updates and restart"
        echo ""
        ;;
esac

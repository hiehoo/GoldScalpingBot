#!/bin/bash

# Mzansi FX VIP Signal Bot - Deployment Script
# Usage: ./deploy.sh [command]
# Commands: setup, start, stop, restart, logs, status, install-docker

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

# Detect docker compose command (v2 or v1)
COMPOSE_CMD=""
detect_compose() {
    if docker compose version &> /dev/null 2>&1; then
        COMPOSE_CMD="docker compose"
    elif command -v docker-compose &> /dev/null; then
        COMPOSE_CMD="docker-compose"
    else
        return 1
    fi
    return 0
}

# Install Docker and Docker Compose
install_docker() {
    log "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    rm get-docker.sh

    log "Adding user to docker group..."
    sudo usermod -aG docker $USER

    log "Installing Docker Compose plugin..."
    sudo apt-get update
    sudo apt-get install -y docker-compose-plugin

    log "Starting Docker service..."
    sudo systemctl enable docker
    sudo systemctl start docker

    log "Docker installed successfully!"
    log "Please log out and back in (or run 'newgrp docker') to use docker without sudo."
    log "Then run: ./deploy.sh setup"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed."
        log "Run: ./deploy.sh install-docker"
        exit 1
    fi
}

# Check if docker-compose is available
check_compose() {
    if ! detect_compose; then
        error "Docker Compose is not available."
        log "Run: sudo apt-get install -y docker-compose-plugin"
        log "Or run: ./deploy.sh install-docker"
        exit 1
    fi
    log "Using: $COMPOSE_CMD"
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
    $COMPOSE_CMD build

    log "Setup complete! Run: ./deploy.sh start"
}

# Start the bot
start() {
    log "Starting Signal Bot..."
    $COMPOSE_CMD up -d
    log "Bot started! Check logs: ./deploy.sh logs"
}

# Stop the bot
stop() {
    log "Stopping Signal Bot..."
    $COMPOSE_CMD down
    log "Bot stopped."
}

# Restart the bot
restart() {
    log "Restarting Signal Bot..."
    $COMPOSE_CMD restart
    log "Bot restarted!"
}

# View logs
logs() {
    $COMPOSE_CMD logs -f --tail=100
}

# Check status
status() {
    echo ""
    log "Container Status:"
    $COMPOSE_CMD ps
    echo ""
    log "Recent Logs:"
    $COMPOSE_CMD logs --tail=20
}

# Update and restart
update() {
    log "Pulling latest changes..."
    git pull origin main

    log "Rebuilding container..."
    $COMPOSE_CMD build --no-cache

    log "Restarting bot..."
    $COMPOSE_CMD up -d

    log "Update complete!"
}

# Main
case "${1:-}" in
    install-docker)
        install_docker
        ;;
    setup)
        check_docker
        check_compose
        setup
        ;;
    start)
        check_docker
        check_compose
        start
        ;;
    stop)
        check_docker
        check_compose
        stop
        ;;
    restart)
        check_docker
        check_compose
        restart
        ;;
    logs)
        check_docker
        check_compose
        logs
        ;;
    status)
        check_docker
        check_compose
        status
        ;;
    update)
        check_docker
        check_compose
        update
        ;;
    *)
        echo "Mzansi FX VIP Signal Bot - Deployment Script"
        echo ""
        echo "Usage: ./deploy.sh [command]"
        echo ""
        echo "Commands:"
        echo "  install-docker  - Install Docker & Docker Compose"
        echo "  setup           - Initial setup (build image)"
        echo "  start           - Start the bot"
        echo "  stop            - Stop the bot"
        echo "  restart         - Restart the bot"
        echo "  logs            - View live logs"
        echo "  status          - Check bot status"
        echo "  update          - Pull updates and restart"
        echo ""
        ;;
esac

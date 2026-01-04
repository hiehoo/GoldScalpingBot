import { vi } from 'vitest';

// Mock environment variables
process.env.TELEGRAM_BOT_TOKEN = 'test-token';
process.env.CHANNEL_ID = '-1001234567890';
process.env.AFFILIATE_LINK = 'https://example.com';

// Setup global test utilities
global.testDataDir = './tests/test-data';

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  redisUrl: process.env.REDIS_URL || '',
  publicSiteUrl: process.env.PUBLIC_SITE_URL || 'http://localhost:4174',
  telegramBotUsername: process.env.TELEGRAM_BOT_USERNAME || '',
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  adminSessionSecret: process.env.ADMIN_SESSION_SECRET || '',
  tronGridApiKey: process.env.TRON_GRID_API_KEY || '',
  moralisApiKey: process.env.MORALIS_API_KEY || '',
  quicknodeRpcUrl: process.env.QUICKNODE_RPC_URL || '',
  alchemyApiKey: process.env.ALCHEMY_API_KEY || '',
  smtpHost: process.env.SMTP_HOST || '',
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || ''
};

declare namespace NodeJS {
  interface ProcessEnv {
    PORT: string;

    DB_HOST: string;
    DB_PORT: string;
    DB_USERNAME: string;
    DB_PASSWORD: string;
    DB_DATABASE: string;

    STRIPE_SECRET_KEY: string;
    PRIVATE_API_KEY: string;
    JWT_SECRET: string;
    JWT_EXPIRATION: string;

    DEV_SUBDOMAIN: string;
    TELEGRAM_BOT_TOKEN: string;
    TELEGRAM_CHAT_ID: string;
    REDIS_URL: string;
    GOOGLE_MAPS_API_KEY: string;
    STRIPE_WEBHOOK_SECRET: string;
  }
}

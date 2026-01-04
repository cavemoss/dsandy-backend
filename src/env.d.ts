declare namespace NodeJS {
  interface ProcessEnv {
    IS_DEV: string;

    PORT: string;

    PRIVATE_API_KEY: string;

    JWT_SECRET: string;

    FRONTEND_HOST: string;

    LOKI_URL: string;

    REDIS_URL: string;

    // db
    DB_HOST: string;
    DB_PORT: string;
    DB_USERNAME: string;
    DB_PASSWORD: string;
    DB_DATABASE: string;

    // aliexpress
    ALIEXPRESS_APP_KEY: string;
    ALIEXPRESS_APP_SECRET: string;

    // stripe
    STRIPE_SECRET_KEY: string;
    STRIPE_WEBHOOK_SECRET: string;

    // telegram
    TELEGRAM_BOT_TOKEN: string;
    TELEGRAM_CHAT_ID: string;

    // mailer
    MAILER_USER: string;
    MAILER_PASS: string;
  }
}

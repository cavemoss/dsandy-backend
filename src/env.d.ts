declare namespace NodeJS {
  interface ProcessEnv {
    PORT: string;

    DB_HOST: string;
    DB_PORT: string;
    DB_USERNAME: string;
    DB_PASSWORD: string;
    DB_DATABASE: string;

    STRIPE_SECRET_KEY: string;
  }
}

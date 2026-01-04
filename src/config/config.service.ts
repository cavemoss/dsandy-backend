import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { redisStore } from 'cache-manager-redis-store';
import { WinstonModuleOptions } from 'nest-winston';
import { join } from 'path';
import Stripe from 'stripe';
import { session } from 'telegraf';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import * as winston from 'winston';
import LokiTransport from 'winston-loki';

export const config = () => {
  const { env } = process;

  return {
    db: {
      type: 'postgres',
      host: env.DB_HOST,
      port: +env.DB_PORT,
      username: env.DB_USERNAME,
      password: env.DB_PASSWORD,
      database: env.DB_DATABASE,
      autoLoadEntities: true,
      synchronize: true,
      namingStrategy: new SnakeNamingStrategy(),
    } satisfies TypeOrmModuleOptions,

    aliexpress: {
      appKey: env.ALIEXPRESS_APP_KEY,
      secretKey: env.ALIEXPRESS_APP_SECRET,
    },

    stripe: {
      client: new Stripe(env.STRIPE_SECRET_KEY, {
        apiVersion: '2025-07-30.basil',
      }),
      webhookSecret: env.STRIPE_WEBHOOK_SECRET,
    },

    telegram: {
      settings: {
        token: env.TELEGRAM_BOT_TOKEN,
        middlewares: [session()],
      },
      chatId: env.TELEGRAM_CHAT_ID,
    },

    redis: {
      settings: {
        store: redisStore({
          url: env.REDIS_URL,
          ttl: 3600,
        }),
      },
    },

    mailer: {
      transport: {
        host: 'smtp.example.com',
        port: 465,
        secure: true,
        auth: {
          user: env.MAILER_USER,
          pass: env.MAILER_PASS,
        },
      },
      defaults: {
        from: '"dsandy" <noreply@yourapp.com>',
      },
      template: {
        dir: join(__dirname, '..', 'templates'),
        adapter: new HandlebarsAdapter(),
        options: { strict: true },
      },
    } satisfies MailerOptions,

    winston: {
      format: winston.format(info => {
        return info;
      })(),
      transports: [
        new LokiTransport({
          host: env.LOKI_URL,
          labels: { service: 'dsandy-backend' },
          format: winston.format.json(),
        }),
        new winston.transports.Console(),
      ],
    } satisfies WinstonModuleOptions,

    admin: {
      privateApiKey: env.PRIVATE_API_KEY,
      frontendHost: env.FRONTEND_HOST,
      jwt: {
        secret: env.JWT_SECRET,
        signOptions: { expiresIn: '1h' },
      } satisfies JwtModuleOptions,
    },
  };
};

export type Config = ReturnType<typeof config>;

@Injectable()
export class ConfigService extends NestConfigService<Config> {
  get db() {
    return this.get('db');
  }

  get aliexpress() {
    return this.get('aliexpress');
  }

  get stripe() {
    return this.get('stripe');
  }

  get telegram() {
    return this.get('telegram');
  }

  get redis() {
    return this.get('redis');
  }

  get mailer() {
    return this.get('mailer');
  }

  get winston() {
    return this.get('winston');
  }

  get admin() {
    return this.get('admin');
  }

  get<T extends keyof Config>(key: T): Config[T] {
    return super.get(key, { infer: true })!;
  }
}

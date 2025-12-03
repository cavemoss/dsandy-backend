import { CacheModule } from '@nestjs/cache-manager';
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { redisStore } from 'cache-manager-redis-store';
import { ClsModule } from 'nestjs-cls';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { AdminModule } from './admin/admin.module';
import { AliexpressModule } from './aliexpress/aliexpress.module';
import { AuthModule } from './auth/auth.module';
import { CronModule } from './cron/cron.module';
import { CustomersController } from './customers/controllers/customers.controller';
import { CustomersModule } from './customers/customers.module';
import { SubdomainMiddleware } from './middleware/subdomain.middleware';
import { OrdersController } from './orders/controllers/orders.controller';
import { OrdersModule } from './orders/orders.module';
import { ProductsController } from './products/controllers/products.controller';
import { ProductsModule } from './products/products.module';
import { StripeModule } from './stripe/stripe.module';
import { TelegramModule } from './telegram/telegram.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
    }),

    CacheModule.registerAsync({
      imports: [ConfigModule],
      isGlobal: true,
      useFactory: (config: ConfigService) => ({
        store: redisStore({
          url: config.get<string>('REDIS_URL'),
          ttl: 3600,
        }),
      }),
      inject: [ConfigService],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: config.get('DB_PORT'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: true,
        namingStrategy: new SnakeNamingStrategy(),
      }),
      inject: [ConfigService],
    }),

    CronModule,
    StripeModule,
    AliexpressModule,
    ProductsModule,
    AuthModule,
    OrdersModule,
    CustomersModule,
    AdminModule,
    TelegramModule,
  ],
})
export class AppModule {
  //yo
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SubdomainMiddleware).forRoutes(
      {
        path: '/admin/subdomain',
        method: RequestMethod.GET,
      },
      {
        path: '/auth/login-customer',
        method: RequestMethod.POST,
      },
      ProductsController,
      CustomersController,
      OrdersController,
    );
  }
}

import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClsModule } from 'nestjs-cls';
import { v4 } from 'uuid';

import { AdminModule } from './admin/admin.module';
import { AliexpressModule } from './aliexpress/aliexpress.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { CronModule } from './cron/cron.module';
import { CustomersController } from './customers/controllers/customers.controller';
import { CustomersModule } from './customers/customers.module';
import { EmailModule } from './email/email.module';
import { LoggerModule } from './logger/logger.module';
import { LoggingMiddleware } from './middleware/logger.middleware';
import { SubdomainMiddleware } from './middleware/subdomain.middleware';
import { OrdersController } from './orders/controllers/orders.controller';
import { OrdersModule } from './orders/orders.module';
import { ProductsController } from './products/controllers/products.controller';
import { ProductsModule } from './products/products.module';
import { RedisModule } from './redis/redis.module';
import { StripeModule } from './stripe/stripe.module';
import { TelegramModule } from './telegram/telegram.module';

@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        generateId: true,
        idGenerator: () => v4(),
      },
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.db,
    }),

    ConfigModule,
    LoggerModule,
    RedisModule,
    EmailModule,
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
      {
        path: '/auth/forgot-password',
        method: RequestMethod.POST,
      },
      ProductsController,
      CustomersController,
      OrdersController,
    );
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}

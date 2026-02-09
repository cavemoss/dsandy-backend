import { Module } from '@nestjs/common';
import { MailerModule as NestJsMailerModule } from '@nestjs-modules/mailer';
import { ConfigModule } from 'src/config/config.module';
import { ConfigService } from 'src/config/config.service';
import { OrdersModule } from 'src/orders/orders.module';

import { MailerService } from './services/mailer.service';

@Module({
  imports: [
    NestJsMailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.mailer,
    }),

    OrdersModule,
  ],
  providers: [MailerService],
  exports: [MailerService],
})
export class MailerModule {}

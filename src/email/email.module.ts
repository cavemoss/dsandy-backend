import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule } from 'src/config/config.module';
import { ConfigService } from 'src/config/config.service';
import { OrdersModule } from 'src/orders/orders.module';

import { EmailService } from './services/email.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.mailer,
    }),

    OrdersModule,
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}

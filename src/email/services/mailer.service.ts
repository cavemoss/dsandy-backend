import { Injectable } from '@nestjs/common';
import { MailerService as NestJsMailerModule } from '@nestjs-modules/mailer';
import { Order } from 'src/orders/entities/order.entity';
import { OrdersService } from 'src/orders/services/orders.service';

@Injectable()
export class MailerService {
  constructor(
    private readonly mailerService: NestJsMailerModule,
    private readonly orderService: OrdersService,
  ) {}

  async sendPasswordRecoveryEmail(email: string, context: { name: string; resetLink: string }) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Password Reset Request',
        template: './recovery',
        context,
      });
    } catch (error) {
      console.log('Error sending password recovery email', error);
    }
  }

  async onNewOrder(order: Order) {}
}

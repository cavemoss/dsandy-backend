import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { formatPrice } from 'lib/utils';
import { InjectBot } from 'nestjs-telegraf';
import { AdminService } from 'src/admin/services/admin.service';
import { OrdersService } from 'src/orders/services/orders.service';
import { Context, Telegraf } from 'telegraf';
import { SceneContext } from 'telegraf/typings/scenes';

@Injectable()
export class TelegramService {
  private readonly tgChatId: string;

  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    readonly configService: ConfigService,

    private readonly ordersService: OrdersService,
    private readonly adminService: AdminService,
  ) {
    this.tgChatId = configService.get('TELEGRAM_CHAT_ID')!;
  }

  async onStart(ctx: Context & SceneContext) {
    const { id: tgChatId } = ctx.chat ?? {};
    if (!tgChatId) return;

    const tenant = await this.adminService.tenantsRepo.findOneBy({ tgChatId });

    if (tenant) {
      await ctx.reply(`${tenant.name}, Welcome back!`);
    } else {
      ctx.session['enterTenantId'] = true;
      await ctx.reply('Please enter your tenant id');
    }
  }

  async registerTenant(ctx: Context & SceneContext, message: string) {
    const { id: tgChatId } = ctx.chat ?? {};

    if (!tgChatId) return;

    const id = parseInt(message);
    const tenant = await this.adminService.tenantsRepo.findOneBy({ id });

    if (!tenant) {
      await ctx.reply(`Tenant with id ${id} doesn't exist`);
    } else {
      await this.adminService.tenantsRepo.update({ id }, { tgChatId });
      await ctx.reply(`${tenant.name}, Welcome!`);
    }

    delete ctx.session['enterTenantId'];
  }

  async testMsg(msg: string) {
    return this.bot.telegram.sendMessage(this.tgChatId, msg);
  }

  async onNewOrder(orderId: number, tgChatId: number | null) {
    if (!tgChatId) return;

    const order = await this.ordersService.ordersRepo.findOneByOrFail({ id: orderId });

    const { shippingInfo: si, contactInfo: ci, paymentInfo: pi } = order;

    const price = formatPrice(pi.amount / 100, pi.currency);

    const message = `There was a new order placed at subdomain <b>${order.subdomainName}</b> for <b>${price}</b>!

<b>Address</b>: ${si.country} ${si.province} ${si.city} ${si.address} ${si.zipCode}

<b>Name</b>: ${ci.firstName} ${ci.lastName}

<b>Email</b>: ${ci.email}

<b>Phone</b>: ${ci.phone}`;

    return this.bot.telegram.sendMessage(tgChatId, message, { parse_mode: 'HTML' });
  }

  async sendUnpaidOrderMessage(orderId: number) {
    const formattedId = `#${orderId.toString().padStart(5, '0')}`;
    const message = `You have an unpaid order <b>${formattedId}</b> placed at Aliexpress!`;

    return this.bot.telegram.sendMessage(this.tgChatId, message, { parse_mode: 'HTML' });
  }
}

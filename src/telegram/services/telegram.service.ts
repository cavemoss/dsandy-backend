import { Injectable } from '@nestjs/common';
import { handleError } from 'lib/utils';
import { ClsService } from 'nestjs-cls';
import { InjectBot } from 'nestjs-telegraf';
import { AdminService } from 'src/admin/services/admin.service';
import { ConfigService } from 'src/config/config.service';
import { LoggerService } from 'src/logger/logger.service';
import { Order } from 'src/orders/entities/order.entity';
import { Context, Telegraf } from 'telegraf';
import { ParseMode } from 'telegraf/typings/core/types/typegram';
import { SceneContext } from 'telegraf/typings/scenes';
import { ExtraReplyMessage } from 'telegraf/typings/telegram-types';

import {
  getConfirmedReceiptMessage,
  getErrorMessage,
  getNewOrderMessage,
  getUnpaidOrderMessage,
} from '../lib/telegram.utils';

@Injectable()
export class TelegramService {
  private readonly tgChatId: string;

  constructor(
    private readonly cls: ClsService,
    private readonly logger: LoggerService,
    protected readonly config: ConfigService,

    @InjectBot() private readonly bot: Telegraf<Context>,

    private readonly adminService: AdminService,
  ) {
    this.tgChatId = config.telegram.chatId;
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

  testMsg(message: string, parseMode: string) {
    return this.bot.telegram.sendMessage(this.tgChatId, message, {
      parse_mode: parseMode as ParseMode,
    });
  }

  onError(message: string, data?: object) {
    return this.bot.telegram.sendMessage(this.tgChatId, getErrorMessage(message, data), {
      parse_mode: 'HTML',
    });
  }

  async sendNewOrderMessage(order: Order, tgChatId: number | null) {
    if (!tgChatId) return;

    try {
      const result = await this.bot.telegram.sendMessage(tgChatId, getNewOrderMessage(order), {
        parse_mode: 'HTML',
      });
      return result.message_id;
    } catch (e) {
      handleError(this.logger, e as Error);
    }
  }

  sendUnpaidOrderMessage(order: Order) {
    const extra: ExtraReplyMessage = {
      parse_mode: 'HTML',
    };
    if (order.tgMessageId) {
      extra.reply_parameters = {
        message_id: order.tgMessageId,
      };
    }
    return this.bot.telegram.sendMessage(this.tgChatId, getUnpaidOrderMessage(order.id), extra);
  }

  async onConfirmOrderReceipt(order: Order) {
    const tenant = await this.adminService.tenantsRepo.findOneBy({
      id: this.cls.get('subdomain.tenantId'),
    });
    if (!tenant?.tgChatId) {
      return;
    }
    const extra: ExtraReplyMessage = {
      parse_mode: 'HTML',
    };
    if (order.tgMessageId) {
      extra.reply_parameters = {
        message_id: order.tgMessageId,
      };
    }
    return this.bot.telegram.sendMessage(
      tenant.tgChatId,
      getConfirmedReceiptMessage(order.aliOrderId!),
      extra,
    );
  }
}

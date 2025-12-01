import { Ctx, Message, On, Start, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { SceneContext } from 'telegraf/typings/scenes';

import { TelegramService } from '../services/telegram.service';

@Update()
export class TelegramUpdate {
  constructor(private readonly telegramService: TelegramService) {}

  @Start()
  onStart(@Ctx() ctx: Context & SceneContext) {
    return this.telegramService.onStart(ctx);
  }

  @On('text')
  async onText(@Ctx() ctx: Context & SceneContext, @Message('text') message: string) {
    switch (true) {
      case ctx.session['enterTenantId']:
        return this.telegramService.registerTenant(ctx, message);
    }
  }
}

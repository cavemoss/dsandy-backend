import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { Request } from 'express';

import { StripeCreatePaymentIntentDTO } from '../dto/stripe.dto';
import { StripeService } from '../service/stripe.service';

@Controller('stripe')
export class StripeController {
  constructor(private readonly service: StripeService) {}

  @Get('retrieve-payment-intent')
  retrievePaymentIntent(@Query('clientSecret') clientSecret: string) {
    return this.service.retrievePaymentIntent(clientSecret);
  }

  @Post('create-payment-intent')
  createPaymentIntent(@Body() body: StripeCreatePaymentIntentDTO) {
    return this.service.createPaymentIntent(body);
  }

  @Post('update-payment-intent')
  updatePaymentIntent(
    @Query('clientSecret') clientSecret: string,
    @Body() body: StripeCreatePaymentIntentDTO,
  ) {
    return this.service.updatePaymentIntent(clientSecret, body);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  handleWebhook(
    @Req() { rawBody }: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.service.handleWebhook(<Buffer>rawBody, signature);
  }
}

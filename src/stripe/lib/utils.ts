import { httpException } from 'lib/utils';
import { LoggerService } from 'src/logger/logger.service';

export const PAYMENT_TIMEOUT = 1200000;

export const getPaymentIntentId = (logger: LoggerService, clientSecret: string) => {
  if (!clientSecret.includes('_secret_')) {
    throw httpException(logger, 'Invalid client secret');
  }
  return clientSecret.split('_secret_')[0];
};

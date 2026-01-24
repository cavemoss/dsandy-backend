import { HttpException, HttpStatus } from '@nestjs/common';
import { LoggerService } from 'src/logger/logger.service';

export const objectByKey = <T extends object>(array: T[], key: keyof T) =>
  Object.fromEntries(array.map(obj => [obj[key], obj])) as Record<string, T>;

export const formatPrice = (amount: number, currency: string) =>
  new Intl.NumberFormat('en', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

export const handleError = (
  logger: LoggerService,
  e: Error,
  handlers: {
    [LABEL: string]:
      | string
      | { message: string; fatal: false }
      | { message: string; fatal?: true; status?: HttpStatus };
  } = {},
) => {
  if (!(e instanceof Error)) e = new Error(String(e));

  const error = {
    message: e.message,
    cause: e.cause,
    stack: e.stack,
    name: e.name,
  };

  const handler = handlers[e.message];

  if (!handler) {
    logger.error('Unhandled', error);
    throw new HttpException(error, 500);
  }

  delete error.stack;

  let message: string, status: HttpStatus, fatal: boolean;

  if (typeof handler == 'string') {
    message = handler;
    status = 400;
    fatal = true;
  } else {
    message = handler.message;
    status = ('status' in handler && handler.status) || 400;
    fatal = handler.fatal ?? true;
  }

  if (fatal) {
    logger.error(message, error);
    throw new HttpException({ message, error }, status);
  }

  logger.warn(message, error);
};

export const httpException = (
  logger: LoggerService,
  message: string,
  data: object = {},
  status: HttpStatus = 400,
) => {
  logger.error(message, data);
  return new HttpException({ message, ...data }, status);
};

export const httpResponse = (message: string, status: HttpStatus = 200) => ({ status, message });

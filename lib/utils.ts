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

export const serializeError = (error: any): Error => {
  const e =
    error instanceof Error
      ? error
      : typeof error == 'object'
        ? new Error(JSON.stringify(error))
        : new Error(String(error));
  return {
    message: e.message,
    cause: e.cause,
    stack: e.stack,
    name: e.name,
  };
};

export const handleError = (
  logger: LoggerService,
  e: any,
  handlers: {
    [LABEL: string]:
      | string
      | { message?: string; fatal: false }
      | { message: string; fatal?: true; status?: HttpStatus };
  } = {},
  defaultFatal = true,
) => {
  const error = serializeError(e);
  const handler = handlers[error.message];

  if (!handler) {
    if (defaultFatal) {
      logger.error('', error);
      throw new HttpException(error, 500);
    } else {
      logger.warn('', error);
      return;
    }
  }

  delete error.stack;

  let message: string, status: HttpStatus, fatal: boolean;

  if (typeof handler == 'string') {
    message = handler;
    status = 400;
    fatal = defaultFatal;
  } else {
    message = handler.message ?? '';
    status = ('status' in handler && handler.status) || 400;
    fatal = handler.fatal ?? defaultFatal;
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

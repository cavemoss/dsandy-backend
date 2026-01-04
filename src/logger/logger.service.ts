import { Inject, Injectable, Scope } from '@nestjs/common';
import { INQUIRER } from '@nestjs/core';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ClsService } from 'nestjs-cls';
import { Logger as WinstonLogger } from 'winston';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService {
  private context?: string;

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: WinstonLogger,
    @Inject(INQUIRER) private readonly parentClass: object | undefined,
    private readonly cls: ClsService,
  ) {
    this.context = this.parentClass && this.parentClass.constructor.name;
  }

  private getLogData(data: object = {}) {
    return {
      requestId: this.cls.getId(),
      context: this.context,
      ...data,
    };
  }

  info(message: string, data?: object) {
    this.logger.info(message, this.getLogData(data));
  }

  error(message: string, data?: object) {
    this.logger.error(message, this.getLogData(data));
  }

  warn(message: string, data?: object) {
    this.logger.warn(message, this.getLogData(data));
  }

  debug(message: string, data?: object) {
    this.logger.debug(message, this.getLogData(data));
  }
}

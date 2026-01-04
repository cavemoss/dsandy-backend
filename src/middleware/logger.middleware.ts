/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { LoggerService } from 'src/logger/logger.service';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  constructor(private readonly logger: LoggerService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    const startTime = Date.now();

    this.logger.info(`Incoming request: ${method} ${originalUrl}`, { body: req.body });

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      this.logger.info(`Response sent: ${method} ${originalUrl}`, {
        statusCode: res.statusCode,
        duration: `${duration}ms`,
      });
    });

    next();
  }
}

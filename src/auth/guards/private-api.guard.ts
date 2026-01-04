import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { ConfigService } from 'src/config/config.service';

@Injectable()
export class PrivateApiGuard implements CanActivate {
  private readonly apiKey: string;

  constructor(protected readonly config: ConfigService) {
    this.apiKey = config.admin.privateApiKey;
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const key = request.headers['x-api-key'];

    if (key !== this.apiKey) {
      throw new HttpException('Invalid API key', HttpStatus.UNAUTHORIZED);
    }
    return true;
  }
}

import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class PrivateApiGuard implements CanActivate {
  private readonly apiKey = process.env.PRIVATE_API_KEY;

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const key = request.headers['x-api-key'];

    if (key !== this.apiKey) {
      throw new HttpException('Invalid API key', HttpStatus.UNAUTHORIZED);
    }
    return true;
  }
}

import { HttpException, HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { ClsService } from 'nestjs-cls';
import { AdminService } from 'src/admin/services/admin.service';

export interface ViewerParams {
  country: string;
  currency: string;
  language: string;
}

@Injectable()
export class SubdomainMiddleware implements NestMiddleware {
  constructor(
    private readonly cls: ClsService,
    private readonly adminService: AdminService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const { origin } = req.headers;

    if (!origin) {
      throw new HttpException('No origin in headers', HttpStatus.BAD_REQUEST);
    }

    const { hostname } = new URL(origin);

    const ptr = hostname.split('.');
    const subdomainName = ptr.length > 1 ? ptr[0] : null;

    if (!subdomainName) {
      throw new HttpException('Subdomain name is missing', HttpStatus.BAD_REQUEST);
    }

    const subdomain = await this.adminService.getSubdomain(subdomainName);
    const { country, currency, language } = req.query;

    if ([country, currency, language].some(p => p == null)) {
      throw new HttpException('Invalid viewer parameters', HttpStatus.BAD_REQUEST);
    }

    this.cls.set('subdomain', subdomain);
    this.cls.set('params', { country, currency, language } as ViewerParams);

    req['subdomain'] = subdomainName;
    next();
  }
}

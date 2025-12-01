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
    const hostname = (req.headers.host ?? req.hostname).split(':')[0];
    let subdomainName: string;

    if (['localhost', '127.0.0.1'].includes(hostname)) {
      subdomainName = process.env.DEV_SUBDOMAIN;
    } else {
      const ptr = hostname.split('.');
      subdomainName = ptr.length === 2 ? ptr[0] : '';
    }

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

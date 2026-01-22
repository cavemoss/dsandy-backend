import { Controller, Get, Res, StreamableFile } from '@nestjs/common';
import { Response } from 'express';
import { GetSubdomain } from 'src/middleware/get-subdomain.decorator';

import { CDNService } from '../services/cdn.service';

@Controller('cdn')
export class CDNController {
  constructor(private readonly service: CDNService) {}

  @Get('favicon')
  async favicon(@GetSubdomain() subdomain: string, @Res({ passthrough: true }) res: Response) {
    const favicon = await this.service.getFavicon(subdomain);

    res.set({
      'Content-Type': 'image/x-icon',
      'Content-Disposition': `inline; filename="${subdomain}.ico"`,
    });

    return new StreamableFile(favicon.data);
  }
}

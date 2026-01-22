import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CDNFavicon } from '../entities/favicon.entity';

@Injectable()
export class CDNService {
  constructor(@InjectRepository(CDNFavicon) private readonly faviconRepo: Repository<CDNFavicon>) {}

  getFavicon(subdomainName: string) {
    return this.faviconRepo.findOneByOrFail({ subdomainName });
  }
}

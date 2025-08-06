import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';
import { Repository } from 'typeorm';
import { ProductCreateDto } from '../dto/products.dto';
import { SubdomainEnum } from 'lib/types';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly repository: Repository<Product>,
  ) {}

  async save(dto: ProductCreateDto) {
    const product = await this.repository.findOneBy({
      aliProductId: dto.aliProductId,
    });

    const model = this.repository.create(dto);
    if (product) model.id = product.id;

    return this.repository.save(model);
  }

  undoScrape(scrapeUid: string) {
    return this.repository.delete({ scrapeUid });
  }

  getBySubdomain(subdomain: SubdomainEnum) {
    return this.repository.findBy({ subdomain });
  }
}

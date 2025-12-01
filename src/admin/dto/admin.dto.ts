import { DProduct } from 'src/products/entities/dynamic-product.entity';

export class AdminCreateTenantDTO {
  name: string;
  email: string;
  password: string;
  subdomain: {
    name: string;
    uniqueName: string;
  };
}

export class AdminSaveDProductsDTO {
  dProducts: Pick<DProduct, 'aliProductId' | 'config'>[];
}

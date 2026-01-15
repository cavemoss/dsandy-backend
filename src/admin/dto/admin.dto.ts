import { DProductCategory } from 'src/products/entities/d-product-category.entity';
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
  dProducts: (Pick<DProduct, 'aliProductId' | 'config'> & {
    categoryIds?: number[];
  })[];
}

export class AdminSaveDProductCategoriesDTO {
  dProductCategories: (Partial<DProductCategory> & {
    title: string;
  })[];
}

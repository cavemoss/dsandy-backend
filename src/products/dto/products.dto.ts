import { SubdomainEnum } from 'lib/types';
import * as ProductJson from './product-json.namespace';
import { SupplierEnum } from 'src/admin/dto/scraper-service.dto';

export class ProductCreateDto {
  subdomain: SubdomainEnum;
  supplier: SupplierEnum;
  scrapeUid: string;

  aliProductId: number;
  inStock: boolean;

  title: string;
  category: string;
  description: string;
  descriptionHtml: string;
  gallery: ProductJson.GalleryItem[];
  specifications: ProductJson.Specification[];

  variants: ProductJson.Variant[];
  variantsSize: ProductJson.VariantSize[];

  feedbackInfo: ProductJson.FeedbackInfo;
  deliveryInfo: ProductJson.DeliveryInfo;
}

export class ProductsGetQueryDto {
  subdomain: SubdomainEnum;
}

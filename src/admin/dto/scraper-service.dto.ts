import { SubdomainEnum } from 'lib/types';

export enum SupplierEnum {
  ALIEXPRESS,
}

export enum BrowserEnum {
  CHROMIUM,
  FIREFOX,
}

export interface CommonScrapeDto {
  subdomain: SubdomainEnum;
  supplier: SupplierEnum;
  browser: BrowserEnum;
}

export interface ScrapeAliexpressDto extends CommonScrapeDto {
  supplier: SupplierEnum.ALIEXPRESS;
  productId: string;
}

export type ScrapeDto = ScrapeAliexpressDto;

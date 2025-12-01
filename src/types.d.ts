import { Subdomain } from './admin/entities/subdomain.entity';
import { ViewerParams } from './middleware/subdomain.middleware';

declare module 'nestjs-cls' {
  interface ClsStore {
    subdomain: Subdomain;
    params: ViewerParams;
  }
}

import { ViewerParams } from 'src/middleware/subdomain.middleware';

import { CustomerInfoDTO } from '../entities/customer.entity';

export interface CreateCustomerDTO {
  email: string;
  password: string;
  info: CustomerInfoDTO;
  preferences: ViewerParams;
}

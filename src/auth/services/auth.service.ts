import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AdminService } from 'src/admin/services/admin.service';
import { CustomersService } from 'src/customers/services/customers.service';

import { LoginDTO } from '../dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly customersService: CustomersService,
    private readonly adminService: AdminService,
    private readonly jwtService: JwtService,
  ) {}

  async loginCustomer(subdomain: string, dto: LoginDTO) {
    const customer = await this.customersService.getCredentials(subdomain, dto.email);
    const isAuthorized = !!customer && (await bcrypt.compare(dto.password, customer.password));

    if (!isAuthorized) throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);

    const jwtPayload = { email: customer.email, sub: customer.id };
    return { accessToken: this.jwtService.sign(jwtPayload) };
  }

  async loginTenant(dto: LoginDTO) {
    const tenant = await this.adminService.getTenantCredentials(dto.email);
    const isAuthorized = !!tenant && (await bcrypt.compare(dto.password, tenant.password));

    if (!isAuthorized) throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);

    const jwtPayload = { email: tenant.email, sub: tenant.id, isAdmin: true };
    return { accessToken: this.jwtService.sign(jwtPayload) };
  }

  async getCustomerByJWTPayload(payload: any) {
    return this.customersService.customersRepo.findOneBy({ id: +payload.sub });
  }

  async getTenantByJWTPayload(payload: any) {
    return this.adminService.tenantsRepo.findOneBy({ id: +payload.sub });
  }
}

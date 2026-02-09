import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AdminService } from 'src/admin/services/admin.service';
import { ConfigService } from 'src/config/config.service';
import { CustomersService } from 'src/customers/services/customers.service';
import { MailerService } from 'src/email/services/mailer.service';

import { AuthErrorEnum, LoginDTO, LoginResponseDTO, ResetPasswordDTO } from '../dto/auth.dto';
import { encryptPassword } from '../lib/auth.utils';

@Injectable()
export class AuthService {
  private readonly frontHost: string;

  constructor(
    protected readonly config: ConfigService,

    private readonly customersService: CustomersService,
    private readonly adminService: AdminService,
    private readonly jwtService: JwtService,
    private readonly emailService: MailerService,
  ) {
    this.frontHost = config.admin.frontendHost;
  }

  async loginCustomer(subdomain: string, dto: LoginDTO): Promise<LoginResponseDTO> {
    const customer = await this.customersService.getCredentials(subdomain, dto.email);

    if (!customer) {
      return {
        errors: { email: AuthErrorEnum.NOT_FOUND },
      };
    }

    const isAuthorized = await bcrypt.compare(dto.password, customer.password);

    if (!isAuthorized) {
      return {
        errors: { password: AuthErrorEnum.INVALID },
      };
    }

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

  async forgotPassword(subdomainName: string, email: string) {
    const customer = await this.customersService.get(subdomainName, email);

    if (!customer) {
      return {
        errors: { email: AuthErrorEnum.NOT_FOUND },
      };
    }

    const payload = { sub: customer.id, email };
    const token = this.jwtService.sign(payload);

    const name = `${customer.info.firstName} ${customer.info.lastName}`;
    const resetLink = `https://${subdomainName}.${this.frontHost}/password-reset?token=${token}`;

    await this.emailService.sendPasswordRecoveryEmail(email, { name, resetLink });
  }

  async resetPassword(dto: ResetPasswordDTO) {
    const { sub: id } = this.jwtService.verify<{ sub: number }>(dto.token);
    const tokenValid = await this.customersService.customersRepo.existsBy({ id });

    if (!tokenValid) {
      throw new HttpException('Invalid token', HttpStatus.NOT_FOUND);
    }

    const password = await encryptPassword(dto.password);
    await this.customersService.patch(id, { password });
  }
}

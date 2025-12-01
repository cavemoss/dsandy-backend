import { Body, Controller, Post } from '@nestjs/common';
import { GetSubdomain } from 'src/middleware/get-subdomain.decorator';

import { LoginDTO } from '../dto/auth.dto';
import { AuthService } from '../services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('login-customer')
  loginCustomer(@GetSubdomain() subdomain: string, @Body() body: LoginDTO) {
    return this.service.loginCustomer(subdomain, body);
  }

  @Post('login-tenant')
  loginTenant(@Body() body: LoginDTO) {
    return this.service.loginTenant(body);
  }
}

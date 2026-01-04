import { Body, Controller, Post, Query } from '@nestjs/common';
import { GetSubdomain } from 'src/middleware/get-subdomain.decorator';

import { LoginDTO, ResetPasswordDTO } from '../dto/auth.dto';
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

  @Post('forgot-password')
  forgotPassword(@GetSubdomain() subdomain: string, @Query('email') email: string) {
    return this.service.forgotPassword(subdomain, decodeURIComponent(email));
  }

  @Post('reset-password')
  resetPassword(@Body() body: ResetPasswordDTO) {
    return this.service.resetPassword(body);
  }
}

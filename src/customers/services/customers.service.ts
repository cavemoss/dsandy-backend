import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthErrorEnum, AuthErrorResponseDTO } from 'src/auth/dto/auth.dto';
import { Repository } from 'typeorm';

import { CreateCustomerDTO } from '../dto/customers.dto';
import { Customer } from '../entities/customer.entity';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    readonly customersRepo: Repository<Customer>,
  ) {}

  async create(subdomainName: string, dto: CreateCustomerDTO) {
    const customerExist = await this.customersRepo.existsBy({
      subdomainName,
      email: dto.email,
    });

    if (customerExist) {
      return {
        errors: {
          email: AuthErrorEnum.DUPLICATE,
        },
      } satisfies AuthErrorResponseDTO;
    }

    const customer = this.customersRepo.create({
      email: dto.email,
      password: dto.password,
      info: dto.info,
      subdomainName,
      preferences: dto.preferences,
    });

    return this.customersRepo.save(customer);
  }

  getCredentials(subdomainName: string, email: string) {
    return this.customersRepo.findOne({
      where: { subdomainName, email },
      select: ['password', 'email', 'id'],
    });
  }

  patch(id: number, dto: Partial<Customer>) {
    return this.customersRepo.update({ id }, dto);
  }

  get(subdomainName: string, email: string) {
    return this.customersRepo.findOneBy({ subdomainName, email });
  }

  getById(id: number) {
    return this.customersRepo.findOneBy({ id });
  }

  async validateCustomerBySubdomain(subdomainName: string, { email }: Customer) {
    const customer = await this.customersRepo.findOneBy({ subdomainName, email });

    if (!customer) {
      throw new HttpException('Invalid JWT Access Token', HttpStatus.UNAUTHORIZED);
    }

    return customer;
  }
}

import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { State } from 'country-state-city';
import * as crypto from 'crypto';
import * as dayjs from 'dayjs';
import { objectByKey } from 'lib/utils';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { ClsService } from 'nestjs-cls';
import { Order } from 'src/orders/entities/order.entity';
import { DProduct } from 'src/products/entities/dynamic-product.entity';
import { mapAliProduct } from 'src/products/lib/products.utils';
import { Repository } from 'typeorm';

import { AliErrorResponseDTO } from '../dto/common.dto';
import { AliDeliveryFreightDTO, AliDeliveryFreightRequestDTO } from '../dto/delivery-freight.dto';
import { AliAccessTokenDTO } from '../dto/oauth.dto';
import { AliPlaceOrderRequestDTO, AliPlaceOrderResponseDTO } from '../dto/order-create-pay.dto';
import { AliProductInfoDTO, AliProductInfoRequestDTO } from '../dto/product-info.dto';
import { AliAccessToken } from '../entities/access-token.entity';

@Injectable()
export class AliexpressService {
  private readonly apiUrl = 'https://api-sg.aliexpress.com/sync';
  private readonly appKey: string;
  private readonly appSecret: string;

  private readonly logger = new Logger(AliexpressService.name);

  constructor(
    private readonly cls: ClsService,
    private readonly configService: ConfigService,

    @InjectRepository(AliAccessToken)
    private readonly aliAccessTokenRepo: Repository<AliAccessToken>,
  ) {
    this.appKey = this.configService.get('ALIEXPRESS_APP_KEY')!;
    this.appSecret = this.configService.get('ALIEXPRESS_APP_SECRET')!;
  }

  private md5SignPayload(p: { [key: string]: string }): string {
    const sortedParams = Object.keys(p)
      .sort()
      .reduce((acc, key) => ((acc[key] = p[key]), acc), {} as { [key: string]: string });

    const sortedString = Object.entries(sortedParams).reduce(
      (acc, [key, value]) => acc + key + value,
      '',
    );

    const bookstandString = this.appSecret + sortedString + this.appSecret;

    return crypto.createHash('md5').update(bookstandString, 'utf8').digest('hex').toUpperCase();
  }

  private stringifyObjects(p: { [key: string]: string }) {
    for (const key in p) {
      if (typeof p[key] === 'object') {
        p[key] = JSON.stringify(p[key]);
      }
    }
  }

  private callMethod(p: AliProductInfoRequestDTO): Promise<AliProductInfoDTO>;
  private callMethod(p: AliDeliveryFreightRequestDTO): Promise<AliDeliveryFreightDTO>;
  private callMethod(p: AliPlaceOrderRequestDTO): Promise<AliPlaceOrderResponseDTO>;

  private async callMethod<P extends { [key: string]: string }>(payload: P) {
    const commonParams = {
      access_token: await this.getAccessToken(),
      app_key: this.appKey,
      timestamp: dayjs().tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss'),
      sign_method: 'md5',
      format: 'json',
      v: '2.0',
    };

    Object.assign(payload, commonParams);
    this.stringifyObjects(payload);
    Object.assign(payload, { sign: this.md5SignPayload(payload) });

    const result = await axios
      .post<AliErrorResponseDTO>(this.apiUrl, new URLSearchParams(payload), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
      })
      .then(res => res.data);

    this.logger.log(`Call method ${payload.method}`, { result });

    if ('error_response' in result) {
      throw new HttpException(
        `${result.error_response.code}: ${result.error_response.msg}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return result;
  }

  // OAuth2 Flow

  private sha256SignPayload(payload: { [key: string]: string }, route: string) {
    const sortedKeys = Object.keys(payload).sort();

    let paramsString = '';
    sortedKeys.forEach(key => (paramsString += key + payload[key]));

    const hmac = crypto.createHmac('sha256', this.appSecret);
    hmac.update(route + paramsString);

    payload.sign = hmac.digest('hex').toUpperCase();
  }

  async getFirstAccessToken(code: string) {
    const url = 'https://api-sg.aliexpress.com/rest/auth/token/create';

    const payload = {
      code,
      app_key: this.appKey,
      sign_method: 'sha256',
      timestamp: dayjs().tz('Asia/Shanghai').valueOf().toString(),
      format: 'json',
      v: '2.0',
    };

    this.sha256SignPayload(payload, '/auth/token/create');

    const result = await axios
      .get<AliAccessTokenDTO>(url, { params: new URLSearchParams(payload) })
      .then(res => res.data);

    if (result.code !== '0') {
      throw new HttpException(result.message, HttpStatus.BAD_REQUEST);
    }

    const aliAccessToken = this.aliAccessTokenRepo.create({
      accessToken: result.access_token,
      refreshToken: result.refresh_token,
      expireTime: result.expire_time,
      id: 1,
    });

    return this.aliAccessTokenRepo.save(aliAccessToken);
  }

  async refreshAccessToken(aliAccessToken?: AliAccessToken) {
    const url = 'https://api-sg.aliexpress.com/rest/auth/token/refresh';

    aliAccessToken ??= await this.aliAccessTokenRepo.findOneByOrFail({ id: 1 });

    const payload = {
      refresh_token: aliAccessToken.refreshToken,
      app_key: this.appKey,
      sign_method: 'sha256',
      timestamp: dayjs().tz('Asia/Shanghai').valueOf().toString(),
      format: 'json',
      v: '2.0',
    };

    this.sha256SignPayload(payload, '/auth/token/refresh');

    const result = await axios
      .get<AliAccessTokenDTO>(url, { params: new URLSearchParams(payload) })
      .then(res => res.data);

    if (result.code !== '0') {
      this.logger.log('Refresh access token error', { result });
      throw new HttpException(result.message, HttpStatus.BAD_REQUEST);
    }

    aliAccessToken = this.aliAccessTokenRepo.create({
      accessToken: result.access_token,
      refreshToken: result.refresh_token,
      expireTime: result.expire_time,
      id: 1,
    });

    return this.aliAccessTokenRepo.save(aliAccessToken);
  }

  private async getAccessToken(): Promise<string | null> {
    let aliAccessToken = await this.aliAccessTokenRepo.findOneBy({ id: 1 });

    if (!aliAccessToken) return null;

    const expireTime = dayjs(aliAccessToken.expireTime);

    if (dayjs().tz('Asia/Shanghai').isAfter(expireTime)) {
      aliAccessToken = await this.refreshAccessToken(aliAccessToken);
    }

    return aliAccessToken.accessToken;
  }

  // Utilization

  async getProductsByViewerParams(dp: DProduct) {
    const { country, currency, language } = this.cls.get('params');

    const result = await this.callMethod({
      method: 'aliexpress.ds.product.get',
      product_id: dp.aliProductId,
      ship_to_country: country,
      target_currency: currency,
      target_language: language,
      remove_personal_benefit: false,
      biz_model: 'biz_model',
    });

    const { rsp_code, rsp_msg } = result.aliexpress_ds_product_get_response;

    if (rsp_code !== 200) {
      this.logger.error(`Error fetching aliexpress product: ${rsp_msg}`);
      return null;
    }

    return mapAliProduct(result, dp);
  }

  async orderCreatePay(order: Order) {
    const { shippingInfo: si, contactInfo: ci } = order;

    const province = State.getStateByCodeAndCountry(si.province, si.country)!;

    const phone = parsePhoneNumberFromString(ci.phone)!;

    const contact = `${si.country} ${ci.firstName} ${ci.lastName}`;

    const dProducts = objectByKey(order.dProducts, 'id');

    const response = await this.callMethod({
      method: 'aliexpress.ds.order.create',
      param_place_order_request4_open_api_d_t_o: {
        logistics_address: {
          address: si.address,
          address2: si.address2,
          country: si.country,
          city: si.city,
          province: province.name,
          zip: si.zipCode,
          full_name: contact,
          contact_person: contact,
          phone_country: phone.countryCallingCode,
          mobile_no: phone.nationalNumber,
        },

        product_items: order.orderItems.map(el => {
          const { aliProductId } = dProducts[el.dProductId];

          return {
            product_id: aliProductId,
            sku_attr: el.skuAttr,
            product_count: el.quantity,
          };
        }),
      },
    });

    const { result } = response.aliexpress_ds_order_create_response;

    if (!result.is_success) {
      this.logger.error(result.error_msg);
      throw new HttpException(`AliexpressService: ${result.error_msg}`, HttpStatus.BAD_REQUEST);
    }

    return result;
  }
}

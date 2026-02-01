import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { State } from 'country-state-city';
import crypto from 'crypto';
import dayjs from 'dayjs';
import { handleError, httpException, objectByKey } from 'lib/utils';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { ClsService } from 'nestjs-cls';
import { ConfigService } from 'src/config/config.service';
import { LoggerService } from 'src/logger/logger.service';
import { ViewerParams } from 'src/middleware/subdomain.middleware';
import { Order } from 'src/orders/entities/order.entity';
import { DProduct } from 'src/products/entities/dynamic-product.entity';
import { mapAliProduct } from 'src/products/lib/products.utils';
import { CacheService } from 'src/redis/services/cache.service';
import { Repository } from 'typeorm';

import { AliErrorResponseDTO } from '../dto/common.dto';
import { AliDeliveryFreightDTO, AliDeliveryFreightRequestDTO } from '../dto/delivery-freight.dto';
import { AliGetProductReviewsDTO, AliProductReviewsDTO } from '../dto/get-reviews.dto';
import { AliAccessTokenDTO } from '../dto/oauth.dto';
import { AliPlaceOrderRequestDTO, AliPlaceOrderResponseDTO } from '../dto/order-create-pay.dto';
import { AliOrderTrackingRequestDTO, AliOrderTrackingResponseDTO } from '../dto/order-tracking';
import { AliProductInfoDTO, AliProductInfoRequestDTO } from '../dto/product-info.dto';
import { AliAccessToken } from '../entities/access-token.entity';

@Injectable()
export class AliexpressService {
  private readonly apiUrl = 'https://api-sg.aliexpress.com/sync';
  private readonly appKey: string;
  private readonly appSecret: string;

  constructor(
    private readonly logger: LoggerService,
    protected readonly config: ConfigService,
    private readonly cls: ClsService,

    @InjectRepository(AliAccessToken)
    private readonly aliAccessTokenRepo: Repository<AliAccessToken>,

    private readonly cacheService: CacheService,
  ) {
    this.appKey = config.aliexpress.appKey;
    this.appSecret = config.aliexpress.secretKey;
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
  private callMethod(p: AliOrderTrackingRequestDTO): Promise<AliOrderTrackingResponseDTO>;

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

    this.logger.info(`Call method ${payload.method}`, { result });

    if ('error_response' in result) {
      throw new Error('ALI_METHOD_CALL_FAILED', {
        cause: `${result.error_response.code}: ${result.error_response.msg}`,
      });
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

    this.logger.info('Ali get first access token', { payload });

    const result = await axios
      .get<AliAccessTokenDTO>(url, { params: new URLSearchParams(payload) })
      .then(res => res.data);

    if (result.code !== '0') {
      throw httpException(this.logger, result.message);
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

    let mustCache = false;

    if (!aliAccessToken) {
      aliAccessToken = await this.aliAccessTokenRepo.findOneByOrFail({ id: 1 });
      mustCache = true;
    }

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
      throw new Error('ALI_REFRESH_TOKEN_ERROR', { cause: result.message });
    }

    this.logger.info('Aliexpress access token refreshed', { result });

    aliAccessToken = this.aliAccessTokenRepo.create({
      accessToken: result.access_token,
      refreshToken: result.refresh_token,
      expireTime: result.expire_time,
      id: 1,
    });

    if (mustCache) {
      void this.cacheService.aliexpressAccessToken.set(aliAccessToken);
    }

    return this.aliAccessTokenRepo.save(aliAccessToken);
  }

  private async getAccessToken(): Promise<string | null> {
    let aliAccessToken = await this.cacheService.aliexpressAccessToken.get();
    aliAccessToken ??= await this.aliAccessTokenRepo.findOneByOrFail({ id: 1 });

    const isTokenExpired = new Date().valueOf() - aliAccessToken.expireTime > 0;

    if (isTokenExpired) {
      aliAccessToken = await this.refreshAccessToken(aliAccessToken);
    }

    if (!aliAccessToken) {
      throw new Error('ALI_NO_ACCESS_TOKEN');
    }

    void this.cacheService.aliexpressAccessToken.set(aliAccessToken);
    return aliAccessToken.accessToken;
  }

  // Utilization

  async getProductsByViewerParams(dp: DProduct) {
    const { country, currency, language } = this.cls.get('params');

    try {
      const result = await this.callMethod({
        method: 'aliexpress.ds.product.get',
        product_id: dp.aliProductId,
        ship_to_country: country,
        target_currency: currency,
        target_language: language,
        remove_personal_benefit: false,
        biz_model: 'biz_model',
      });

      await new Promise(res => setTimeout(res, 1000));

      const { rsp_code, rsp_msg } = result.aliexpress_ds_product_get_response;

      if (rsp_code !== 200) {
        throw new Error('ALI_GET_PRODUCT_FAIL', { cause: rsp_msg });
      }

      return mapAliProduct(result, dp);
    } catch (e) {
      handleError(this.logger, e as Error, {
        ALI_GET_PRODUCT_FAIL: {
          message: `Error fetching product ${dp.aliProductId} from aliexpress`,
          fatal: false,
        },
        ALI_NO_SCUS: {
          fatal: false,
        },
        ALI_SCU_COMBINATIONS_ERROR: {
          fatal: false,
        },
        ALI_NO_ACCESS_TOKEN: 'Aliexpress access token is missing altogether',
        ALI_REFRESH_TOKEN_ERROR: 'Failed to refresh access token',
        ALI_METHOD_CALL_FAILED: 'Aliexpress method call failed',
      });
    }
  }

  async orderCreatePay(order: Order) {
    if (!order.orderItems.length) {
      throw new Error('NO_ORDER_ITEMS', { cause: { order } });
    }

    const { shippingInfo: si, contactInfo: ci } = order;

    const province = State.getStateByCodeAndCountry(si.province, si.country);

    if (!province) {
      throw new Error('ALI_PLACE_ORDER_NO_PROVINCE', {
        cause: { province, order },
      });
    }

    const phone = parsePhoneNumberFromString(ci.phone);

    if (!phone) {
      throw new Error('ALI_PLACE_ORDER_NO_PHONE', {
        cause: { phone, order },
      });
    }

    const contact = `${si.country} ${ci.firstName} ${ci.lastName}`;

    const dProducts = objectByKey(order.dProducts, 'id');

    let requestBody = {};

    const response = await this.callMethod({
      method: 'aliexpress.ds.order.create',
      param_place_order_request4_open_api_d_t_o: (requestBody = {
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
      }),
    });

    const { result } = response.aliexpress_ds_order_create_response;

    if (!result.is_success) {
      throw new Error('ALI_PLACE_ORDER_FAILED', {
        cause: { order, result, requestBody },
      });
    }

    return result;
  }

  async orderTracking(aliOrderId: number, lang: string = 'en') {
    const response = await this.callMethod({
      method: 'aliexpress.ds.order.tracking.get',
      language: lang,
      ae_order_id: aliOrderId,
    });

    const { result } = response.aliexpress_ds_order_tracking_get_response;

    if (result.ret) {
      return result.data.tracking_detail_line_list;
    }

    if (result.code == '1001') {
      this.logger.warn(`Ali order tracking data not found for ${aliOrderId}`, { result });
      return;
    }

    throw new Error('ALI_FAIL', { cause: result });
  }

  async getProductReviews(dto: AliGetProductReviewsDTO) {
    const url = 'https://feedback.aliexpress.com/pc/searchEvaluation.do';

    const { aliProductId: productId, page, pageSize } = dto;
    const { language: lang, country } = this.cls.get('params');

    const params = {
      productId,
      page,
      pageSize,
      lang,
      country,
      filter: 'all',
      sort: 'complex_default',
    };

    const response = await axios.get<AliProductReviewsDTO>(url, { params });

    const isSuccess: boolean =
      (<string>response.headers['content-type'])?.startsWith('application/json') &&
      !!response.data.data;

    if (!isSuccess) {
      throw new Error('ALI_FAIL', {
        cause: response.data.antiCrawlerContent ?? { response: response.data },
      });
    }

    return response.data;
  }
}

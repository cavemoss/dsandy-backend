import { Type } from 'class-transformer';

import { aliGetReviewsExp1, aliGetReviewsExp2 } from '../examples/get-reviews';

export class AliGetProductReviewsDTO {
  @Type(() => Number) aliProductId: number;
  @Type(() => Number) page: number;
  @Type(() => Number) pageSize: number = 10;
}

export type AliProductReviewsDTO = typeof aliGetReviewsExp1 & typeof aliGetReviewsExp2;

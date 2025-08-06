import { Injectable } from '@nestjs/common';
import {
  ScrapeAliexpressDto,
  ScrapeDto,
  SupplierEnum,
} from '../dto/scraper-service.dto';
import { chromium } from 'playwright-extra';

import { BrowserContextOptions, LaunchOptions, Page } from 'playwright';

import {
  clickElement,
  getDeliveryTimeRange,
  getImgSrc,
  getInnerHtml,
  getInnerText,
} from '../lib/scraper-service.utils';
import { ProductsService } from 'src/products/service/products.service';

import { randomUUID } from 'node:crypto';
import * as ProductJson from 'src/products/dto/product-json.namespace';

@Injectable()
export class ScraperService {
  constructor(private readonly productsService: ProductsService) {}

  private readonly lunchOptions: LaunchOptions = {
    headless: false,
    devtools: true,
    args: [
      '--start-maximized',
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--private',
    ],
    executablePath:
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  };

  private readonly browserContextOptions: BrowserContextOptions = {
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: null,
  };

  async scrape(dto: ScrapeDto) {
    const browser = await chromium.launch(this.lunchOptions);
    const context = await browser.newContext(this.browserContextOptions);
    const page = await context.newPage();

    await context.clearCookies();
    page.setDefaultTimeout(200000);

    try {
      return await this.scrapeAliexpress(page, dto);
    } catch (error) {
      console.error('Error during scraping', error);
    } finally {
      await browser.close();
    }
  }

  private async scrapeAliexpress(page: Page, dto: ScrapeAliexpressDto) {
    const productUrl = `https://www.aliexpress.com/item/${dto.productId}.html`;

    await page.goto(productUrl, { waitUntil: 'domcontentloaded' });

    const selectors = {
      viewMoreBtn: `div[class^="sku-item--viewMore--"]`,
      variant: `div[class^="sku-item--skus--"] > div`,
      variantTitle: `div[class^="sku-item--title--"] > span > span`,
      variantImage: `img[class^="magnifier--image--"]`,
      priceOriginal: `span[class^="price--originalText--"]`,
      priceCurrent: `span[class^="price--currentPriceText--"]`,
      title: `div[class^="title--wrap--"] > h1`,
      reviewerRating: `a[class^="reviewer--rating--"] > strong`,
      reviewerReviews: `a[class^="reviewer--reviews--"]`,
      reviewerSold: `span[class^="reviewer--sold--"]`,
      description: `#product-description`,
      delivery: `.dynamic-shipping-line.dynamic-shipping-contentLayout span:nth-child(2) > span > strong`,
      courier: `.dynamic-shipping-line.dynamic-shipping-contentLayout:nth-child(3) :not(:first-child):not(:last-child) > img`,
    } as const;

    // Scraping product variants
    await page.waitForSelector(selectors.viewMoreBtn);

    await clickElement(page, selectors.viewMoreBtn);

    const variants: ProductJson.Variant[] = [];

    const $$variants = await page.$$(selectors.variant);

    for (const $div of $$variants) {
      await $div.click();

      const imgSrcPreview = await getImgSrc($div, 'img');

      const imgSrc = await getImgSrc(page, selectors.variantImage);

      const title = await getInnerText(page, selectors.variantTitle);

      const priceUSD = await getInnerText(
        page,
        'span[class^="price-default--original--"] > bdi',
      ).then((text) => parseFloat(text.slice(1)));

      variants.push({ title, priceUSD, imgSrcPreview, imgSrc });
    }

    // Scraping general product data
    const title = await getInnerText(page, selectors.title);

    const rating = await getInnerText(page, selectors.reviewerRating).then(
      (text) => parseFloat(text),
    );

    const displayReviews = await getInnerText(page, selectors.reviewerReviews);

    const displaySold = await getInnerText(page, selectors.reviewerSold);

    const durationDays = await getInnerText(page, selectors.delivery).then(
      (text) => getDeliveryTimeRange(text),
    );

    // Scraping description html
    await page.waitForSelector(selectors.description);

    await page
      .$(selectors.description)
      .then((el) => el?.scrollIntoViewIfNeeded());

    const descriptionHtml = await getInnerHtml(page, selectors.description);

    // Scraping courier companies
    const courierCompanies: ProductJson.CourierCompany[] = [];

    const $$couriers = await page.$$(selectors.courier);

    for (const $img of $$couriers) {
      const iconSrc = await getImgSrc($img);

      courierCompanies.push({ iconSrc });
    }

    // Creating the product entity
    return this.productsService.save({
      subdomain: dto.subdomain,
      supplier: SupplierEnum.ALIEXPRESS,
      scrapeUid: randomUUID(),
      aliProductId: parseInt(dto.productId),
      inStock: true,
      title,
      category: '',
      descriptionHtml,
      description: '',
      gallery: [],
      specifications: [],
      variants,
      variantsSize: [],
      feedbackInfo: {
        rating,
        displayReviews,
        displaySold,
      },
      deliveryInfo: {
        durationDays,
        courierCompanies,
      },
    });
  }
}

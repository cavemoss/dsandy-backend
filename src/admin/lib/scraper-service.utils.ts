import { ElementHandle, Page } from 'playwright';
import * as dayjs from 'dayjs';

type Handle = ElementHandle<SVGElement | HTMLElement>;

type Overload = {
  ($handle: Handle): Promise<string>;
  ($handle: Page | Handle, selector: string): Promise<string>;
};

export const clickElement = ($handle: Page | Handle, selector: string) =>
  $handle.$(selector).then(($hdl) => $hdl?.click());

export const getInnerText = ($handle: Page | Handle, selector: string) =>
  $handle.$eval(selector, (el) => (<HTMLElement>el)?.innerText);

export const getInnerHtml = ($handle: Page | Handle, selector: string) =>
  $handle.$eval(selector, (el) => el.innerHTML);

export const getImgSrc: Overload = async (
  $handle: Page | Handle,
  selector?: string,
) => {
  if (selector === undefined) {
    return (<Handle>$handle).evaluate((el) => el.getAttribute('src') ?? '');
  }
  const $img = await $handle.$(selector);
  return $img?.evaluate((el) => el.getAttribute('src') ?? '') ?? '';
};

export const getDeliveryTimeRange = (innerText: string): [number, number] => {
  const currentDate = dayjs();

  const currentYear = currentDate.year();
  const [month, startDay, endDay] = innerText.split(/[\s-]+/);

  const startDate = dayjs(`${month} ${startDay} ${currentYear}`, 'MMM DD YYYY');
  const endDate = dayjs(`${month} ${endDay} ${currentYear}`, 'MMM DD YYYY');

  if (!startDate.isValid() || !endDate.isValid()) {
    console.error('Invalid date format');
    return [0, 0];
  }

  const diffToStart = startDate.diff(currentDate, 'day');
  const diffToEnd = endDate.diff(currentDate, 'day');

  return [diffToStart, diffToEnd];
};

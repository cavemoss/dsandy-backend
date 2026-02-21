import { formatPrice } from 'lib/utils';
import { Order } from 'src/orders/entities/order.entity';
import { ExtraReplyMessage } from 'telegraf/typings/telegram-types';

export const getReplayParams = (order: Order) => {
  const result: ExtraReplyMessage = {
    parse_mode: 'HTML',
  };
  if (order.tgMessageId) {
    result.reply_parameters = {
      message_id: order.tgMessageId,
    };
  }
  return result;
};

export const getNewOrderMessage = (order: Order) => {
  const { metadata, shippingInfo: s, contactInfo: c, paymentInfo: p } = order;

  const price = formatPrice(p.amount / 100, p.currency);

  const profit = formatPrice(metadata.profit / 100, p.currency);

  const products = Object.values(metadata.products).map(el => {
    let result = `<b>${el.name.length > 80 ? el.name.slice(0, 80) + '...' : el.name}</b>\n`;
    el.variants.forEach(el => (result += `(${el.quantity}x) ${el.properties.join('; ')}\n`));
    return result;
  });

  return `There was a new order placed at subdomain <code>${order.subdomainName}</code> for <code>${price}</code>!
<b>Profit</b>: <code>${profit}</code>\n
${products.join('\n')}
<b>Address</b>: ${s.country} ${s.province} ${s.city} ${s.address} ${s.zipCode}
<b>Name</b>: ${c.firstName} ${c.lastName}
<b>Phone</b>: ${c.phone}`;
};

export const getUnpaidOrderMessage = (aliOrderId: number) => {
  return `You have an unpaid order <code>${aliOrderId}</code> placed at Aliexpress!`;
};

export const getConfirmedReceiptMessage = (aliOrderId: number) => {
  return `Congrats!
Customer just confirmed receipt for order <code>${aliOrderId}</code>!`;
};

export const getErrorMessage = (message: string, data?: object) =>
  message +
  (data != null && typeof data === 'object' ? `\n<pre>${JSON.stringify(data, null, 2)}</pre>` : '');

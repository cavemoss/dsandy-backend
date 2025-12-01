export const objectByKey = <T extends object>(array: T[], key: keyof T) =>
  Object.fromEntries(array.map(obj => [obj[key], obj])) as Record<string, T>;

export const formatPrice = (amount: number, currency: string) =>
  new Intl.NumberFormat('en', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

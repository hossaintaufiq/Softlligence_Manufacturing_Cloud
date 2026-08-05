export type CurrencyRate = {
  code: string;
  name: string;
  symbol: string;
  rateToUsd: number;
};

const fxRatesStore: CurrencyRate[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', rateToUsd: 1.0 },
  { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', rateToUsd: 118.5 },
  { code: 'EUR', name: 'Euro', symbol: '€', rateToUsd: 0.92 },
  { code: 'GBP', name: 'British Pound', symbol: '£', rateToUsd: 0.78 },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', rateToUsd: 83.4 },
];

export async function getCurrencyRates() {
  return fxRatesStore;
}

export async function convertCurrency(amount: number, fromCode: string, toCode: string) {
  const from = fxRatesStore.find((c) => c.code === fromCode.toUpperCase()) || fxRatesStore[0];
  const to = fxRatesStore.find((c) => c.code === toCode.toUpperCase()) || fxRatesStore[0];

  const amountUsd = amount / from.rateToUsd;
  const converted = Number((amountUsd * to.rateToUsd).toFixed(2));

  return {
    fromCode: from.code,
    toCode: to.code,
    originalAmount: amount,
    convertedAmount: converted,
    exchangeRate: Number((to.rateToUsd / from.rateToUsd).toFixed(4)),
  };
}

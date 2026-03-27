const EXCHANGE_RATE_CACHE_TTL_MS = 60 * 60 * 1000;
const exchangeRateCache = new Map();

const normalizeCurrencyCode = (currency) => {
  if (typeof currency !== 'string' || currency.trim().length !== 3) {
    return null;
  }

  return currency.trim().toUpperCase();
};

const getCacheKey = (fromCurrency, toCurrency) => `${fromCurrency}->${toCurrency}`;

export const getExchangeRate = async (fromCurrencyInput, toCurrencyInput) => {
  const fromCurrency = normalizeCurrencyCode(fromCurrencyInput);
  const toCurrency = normalizeCurrencyCode(toCurrencyInput);

  if (!fromCurrency || !toCurrency) {
    throw new Error('Invalid currency code');
  }

  if (fromCurrency === toCurrency) {
    return 1;
  }

  const cacheKey = getCacheKey(fromCurrency, toCurrency);
  const cached = exchangeRateCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.rate;
  }

  const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
  if (!response.ok) {
    throw new Error('Unable to fetch exchange rates');
  }

  const payload = await response.json();
  const rate = payload?.rates?.[toCurrency];

  if (!Number.isFinite(rate) || rate <= 0) {
    throw new Error(`Exchange rate not found for ${toCurrency}`);
  }

  exchangeRateCache.set(cacheKey, {
    rate,
    expiresAt: Date.now() + EXCHANGE_RATE_CACHE_TTL_MS,
  });

  return rate;
};

export const convertAmountToCurrency = async ({ amount, fromCurrency, toCurrency }) => {
  const parsedAmount = Number(amount);
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    throw new Error('Invalid amount');
  }

  const rate = await getExchangeRate(fromCurrency, toCurrency);
  return parsedAmount * rate;
};

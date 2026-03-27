export const SUPPORTED_CURRENCIES = [
  'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'INR', 'AED', 'AFN', 'ALL', 'AMD', 'ANG', 'AOA', 'ARS',
  'AWG', 'AZN', 'BAM', 'BBD', 'BDT', 'BGN', 'BHD', 'BIF', 'BMD', 'BND', 'BOB', 'BRL', 'BSD', 'BTN',
  'BWP', 'BYN', 'BZD', 'CDF', 'CHF', 'CLP', 'CNY', 'COP', 'CRC', 'CUC', 'CUP', 'CVE', 'CZK', 'DJF',
  'DKK', 'DOP', 'DZD', 'EGP', 'ERN', 'ETB', 'FJD', 'FKP', 'FOK', 'GEL', 'GHS', 'GIP', 'GMD', 'GNF',
  'GTQ', 'GYD', 'HKD', 'HNL', 'HRK', 'HTG', 'HUF', 'IDR', 'ILS', 'IQD', 'IRR', 'ISK', 'JMD', 'JOD',
  'KES', 'KGS', 'KHR', 'KMF', 'KRW', 'KWD', 'KYD', 'KZT', 'LAK', 'LBP', 'LKR', 'LRD', 'LSL', 'LYD',
  'MAD', 'MDL', 'MGA', 'MKD', 'MMK', 'MNT', 'MOP', 'MRU', 'MUR', 'MVR', 'MWK', 'MXN', 'MYR', 'MZN',
  'NAD', 'NGN', 'NIO', 'NOK', 'NPR', 'NZD', 'OMR', 'PAB', 'PEN', 'PGK', 'PHP', 'PKR', 'PLN', 'PYG',
  'QAR', 'RON', 'RSD', 'RUB', 'RWF', 'SAR', 'SBD', 'SCR', 'SDG', 'SEK', 'SGD', 'SHP', 'SLL', 'SOS',
  'SRD', 'SSP', 'STN', 'SYP', 'SZL', 'THB', 'TJS', 'TMT', 'TND', 'TOP', 'TRY', 'TTD', 'TWD', 'TZS',
  'UAH', 'UGX', 'UYU', 'UZS', 'VES', 'VND', 'VUV', 'WST', 'XAF', 'XCD', 'XOF', 'XPF', 'YER', 'ZAR',
  'ZMW', 'ZWL'
];

export const normalizeCurrencyCode = (currency, fallback = 'USD') => {
  if (typeof currency !== 'string' || currency.trim().length !== 3) {
    return fallback;
  }
  return currency.trim().toUpperCase();
};

export const getCompanyBaseCurrency = (user, fallback = 'USD') => {
  return normalizeCurrencyCode(user?.company?.baseCurrency, fallback);
};

export const formatCurrencyAmount = (value, currency, options = {}) => {
  const amount = Number(value) || 0;
  const code = normalizeCurrencyCode(currency);

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
      minimumFractionDigits: options.minimumFractionDigits ?? 2,
      maximumFractionDigits: options.maximumFractionDigits ?? 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(options.maximumFractionDigits ?? 2)} ${code}`;
  }
};

export const formatNumber = (value) => new Intl.NumberFormat('en-US').format(Number(value) || 0);

export const convertCurrencyAmount = async ({ amount, fromCurrency, toCurrency }) => {
  const parsedAmount = Number(amount);
  const source = normalizeCurrencyCode(fromCurrency);
  const target = normalizeCurrencyCode(toCurrency);

  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    throw new Error('Amount must be a positive number');
  }

  if (source === target) {
    return {
      convertedAmount: parsedAmount,
      rate: 1,
      fromCurrency: source,
      toCurrency: target,
    };
  }

  const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${source}`);
  if (!response.ok) {
    throw new Error('Failed to fetch exchange rates');
  }

  const data = await response.json();
  const rate = data?.rates?.[target];
  if (!rate || !Number.isFinite(rate)) {
    throw new Error(`Exchange rate not found for ${target}`);
  }

  return {
    convertedAmount: parsedAmount * rate,
    rate,
    fromCurrency: source,
    toCurrency: target,
  };
};

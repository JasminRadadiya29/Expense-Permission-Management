const DEFAULT_WINDOW_MS = 15 * 60 * 1000;
const DEFAULT_MAX_REQUESTS = 60;

const globalStore = globalThis;
if (!globalStore.__expenseRateLimiterStore) {
  globalStore.__expenseRateLimiterStore = new Map();
}

const rateStore = globalStore.__expenseRateLimiterStore;

const getClientIp = (request) => {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  return (
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    'unknown'
  );
};

const normalizeKeyValue = (value) => {
  if (value === null || value === undefined) return 'none';
  return String(value).trim().toLowerCase() || 'empty';
};

const getValueFromPath = (source, path) => {
  if (!source || !path) return undefined;

  const segments = String(path).split('.');
  let cursor = source;
  for (const segment of segments) {
    if (cursor == null) return undefined;
    cursor = cursor[segment];
  }

  return cursor;
};

const buildIdentifier = ({ request, body, params, identifierFields = [] }) => {
  const ip = getClientIp(request);
  const parts = [ip];

  for (const fieldPath of identifierFields) {
    if (fieldPath.startsWith('params.')) {
      const key = fieldPath.replace('params.', '');
      parts.push(normalizeKeyValue(getValueFromPath(params, key)));
      continue;
    }

    parts.push(normalizeKeyValue(getValueFromPath(body, fieldPath)));
  }

  return parts.join('|');
};

export const applyRateLimit = ({
  request,
  body,
  params,
  config,
}) => {
  const {
    key,
    maxRequests = DEFAULT_MAX_REQUESTS,
    windowMs = DEFAULT_WINDOW_MS,
    identifierFields = [],
  } = config || {};

  if (!key) {
    return { allowed: true };
  }

  const identifier = buildIdentifier({ request, body, params, identifierFields });
  const bucketKey = `${key}:${identifier}`;

  const now = Date.now();
  const existing = rateStore.get(bucketKey);

  if (!existing || now >= existing.resetAt) {
    rateStore.set(bucketKey, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  existing.count += 1;
  rateStore.set(bucketKey, existing);

  if (existing.count > maxRequests) {
    const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
    return {
      allowed: false,
      retryAfterSeconds,
    };
  }

  return { allowed: true };
};

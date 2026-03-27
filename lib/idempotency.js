const IDEMPOTENCY_KEY_TIMEOUT = 24 * 3600000; // 24 hours
const idempotencyStore = new Map();

const cleanupExpiredKeys = () => {
  const now = Date.now();
  const expired = Array.from(idempotencyStore.entries())
    .filter(([, record]) => now - record.createdAt > IDEMPOTENCY_KEY_TIMEOUT)
    .map(([key]) => key);

  expired.forEach((key) => idempotencyStore.delete(key));
};

export const checkIdempotency = async (key) => {
  if (!key || typeof key !== 'string') {
    return null;
  }

  cleanupExpiredKeys();
  return idempotencyStore.get(key) || null;
};

export const storeIdempotency = async (key, response) => {
  cleanupExpiredKeys();
  idempotencyStore.set(key, {
    response,
    createdAt: Date.now(),
  });
};

export const isValidIdempotencyKey = (key) => {
  return key && typeof key === 'string' && key.length > 0 && key.length <= 255;
};

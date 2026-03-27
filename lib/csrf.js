import crypto from 'crypto';

const CSRF_SESSION_TIMEOUT = 3600000; // 1 hour
const CSRF_SECRET = process.env.CSRF_SECRET || process.env.JWT_SECRET || '';

const timingSafeEquals = (left, right) => {
  const leftBuffer = Buffer.from(left, 'utf8');
  const rightBuffer = Buffer.from(right, 'utf8');

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

const buildSignature = (payload) => crypto
  .createHmac('sha256', CSRF_SECRET)
  .update(payload)
  .digest('hex');

export const generateCSRFToken = () => {
  if (!CSRF_SECRET) {
    throw new Error('Missing CSRF secret. Set CSRF_SECRET or JWT_SECRET.');
  }

  const timestamp = Date.now().toString();
  const nonce = crypto.randomBytes(16).toString('hex');
  const payload = `${timestamp}.${nonce}`;
  const signature = buildSignature(payload);

  return `${payload}.${signature}`;
};

export const verifyCSRFToken = (token) => {
  if (!CSRF_SECRET || !token || typeof token !== 'string') {
    return false;
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return false;
  }

  const [timestamp, nonce, signature] = parts;
  const parsedTimestamp = Number.parseInt(timestamp, 10);

  if (!Number.isFinite(parsedTimestamp)) {
    return false;
  }

  const now = Date.now();
  if (now - parsedTimestamp > CSRF_SESSION_TIMEOUT || parsedTimestamp > now + 30000) {
    return false;
  }

  const payload = `${timestamp}.${nonce}`;
  const expectedSignature = buildSignature(payload);

  if (!timingSafeEquals(expectedSignature, signature)) {
    return false;
  }

  return true;
};

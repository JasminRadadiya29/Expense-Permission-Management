import { NextResponse } from 'next/server';
import { connectDB } from './db.js';
import { auth, authorize } from '../server/middleware/auth.js';
import { applyRateLimit } from './rateLimiter.js';
import { verifyCSRFToken } from './csrf.js';
import { checkIdempotency, storeIdempotency, isValidIdempotencyKey } from './idempotency.js';

const parseBody = async (request) => {
  const method = request.method.toUpperCase();
  if (method === 'GET' || method === 'HEAD') {
    return { body: {}, invalidJson: false };
  }

  const contentLength = request.headers.get('content-length');
  const contentType = (request.headers.get('content-type') || '').toLowerCase();

  // Some endpoints (for example, submit actions) intentionally send POST with no body.
  if (contentLength === '0') {
    return { body: {}, invalidJson: false };
  }

  const rawBody = await request.text();
  if (!rawBody.trim()) {
    return { body: {}, invalidJson: false };
  }

  if (!contentType.includes('application/json')) {
    return { body: {}, invalidJson: false };
  }

  try {
    return { body: JSON.parse(rawBody), invalidJson: false };
  } catch {
    return { body: {}, invalidJson: true };
  }
};

const createMockRes = () => {
  return {
    statusCode: 200,
    payload: null,
    sent: false,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.payload = data;
      this.sent = true;
      return this;
    }
  };
};

const runExpressMiddleware = async (middleware, req, res) => {
  return new Promise((resolve, reject) => {
    let resolved = false;

    const next = (error) => {
      if (resolved) return;
      resolved = true;
      if (error) {
        reject(error);
        return;
      }
      resolve(true);
    };

    try {
      const maybePromise = middleware(req, res, next);
      Promise.resolve(maybePromise)
        .then(() => {
          if (!resolved) {
            resolved = true;
            resolve(false);
          }
        })
        .catch(reject);
    } catch (error) {
      reject(error);
    }
  });
};

export const executeController = async (request, controller, options = {}) => {
  const { params = {}, roles = null, validateBody = null, rateLimit = null, csrf = false, idempotent = false } = options;

  try {
    await connectDB();

    const { body, invalidJson } = await parseBody(request);

    if (invalidJson) {
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    if (typeof validateBody === 'function') {
      const validationError = validateBody(body);
      if (validationError) {
        return NextResponse.json(validationError, { status: 400 });
      }
    }

    if (rateLimit) {
      const rateLimitResult = applyRateLimit({
        request,
        body,
        params,
        config: rateLimit,
      });

      if (!rateLimitResult.allowed) {
        return NextResponse.json(
          {
            error: 'Too many requests. Please try again later.',
            retryAfterSeconds: rateLimitResult.retryAfterSeconds,
          },
          {
            status: 429,
            headers: {
              'Retry-After': String(rateLimitResult.retryAfterSeconds),
            },
          },
        );
      }
    }

    if (csrf && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method.toUpperCase())) {
      const csrfToken = request.headers.get('x-csrf-token');
      if (!csrfToken || !verifyCSRFToken(csrfToken)) {
        return NextResponse.json(
          { error: 'Invalid or missing CSRF token' },
          { status: 403 }
        );
      }
    }

    if (idempotent && ['POST', 'PUT', 'PATCH'].includes(request.method.toUpperCase())) {
      const idempotencyKey = request.headers.get('idempotency-key');
      if (idempotencyKey && isValidIdempotencyKey(idempotencyKey)) {
        const existing = await checkIdempotency(idempotencyKey);
        if (existing) {
          return NextResponse.json(existing.response, { status: 200 });
        }
      }
    }

    const req = {
      method: request.method,
      body,
      params,
      query: Object.fromEntries(request.nextUrl.searchParams.entries()),
      header: (name) => request.headers.get(name),
      headers: Object.fromEntries(request.headers.entries()),
    };

    const res = createMockRes();

    if (roles !== null) {
      await runExpressMiddleware(auth, req, res);
      if (res.sent) {
        return NextResponse.json(res.payload, { status: res.statusCode });
      }

      await runExpressMiddleware(authorize(...roles), req, res);
      if (res.sent) {
        return NextResponse.json(res.payload, { status: res.statusCode });
      }
    }

    await controller(req, res);

    const responseBody = res.payload ?? {};
    
    if (idempotent && ['POST', 'PUT', 'PATCH'].includes(request.method.toUpperCase())) {
      const idempotencyKey = request.headers.get('idempotency-key');
      if (idempotencyKey && isValidIdempotencyKey(idempotencyKey)) {
        await storeIdempotency(idempotencyKey, responseBody);
      }
    }

    return NextResponse.json(responseBody, { status: res.statusCode || 200 });
  } catch (error) {
    console.error('Route handler error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
};

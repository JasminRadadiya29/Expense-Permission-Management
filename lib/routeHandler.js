import { NextResponse } from 'next/server';
import { connectDB } from './db.js';
import { auth, authorize } from '../server/middleware/auth.js';

const parseBody = async (request) => {
  const method = request.method.toUpperCase();
  if (method === 'GET' || method === 'HEAD') {
    return {};
  }

  try {
    return await request.json();
  } catch {
    return {};
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
  const { params = {}, roles = null } = options;

  try {
    await connectDB();

    const req = {
      method: request.method,
      body: await parseBody(request),
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

    return NextResponse.json(res.payload ?? {}, { status: res.statusCode || 200 });
  } catch (error) {
    console.error('Route handler error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
};

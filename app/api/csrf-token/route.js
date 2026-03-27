import { generateCSRFToken } from '../../../lib/csrf.js';

export const runtime = 'nodejs';

export async function GET(request) {
  try {
    const token = generateCSRFToken();
    return Response.json({
      csrfToken: token,
    });
  } catch (error) {
    console.error('CSRF token generation error:', error);
    return Response.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    );
  }
}

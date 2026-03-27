// EmailJS Configuration
// Prefer NEXT_PUBLIC_* environment variables for deployment.
export const EMAILJS_CONFIG = {
  SERVICE_ID: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '',
  PUBLIC_KEY: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || '',
  TEMPLATES: {
    PASSWORD_RESET: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_PASSWORD_RESET || '',
    WELCOME: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_WELCOME || ''
  }
};

const looksLikePlaceholder = (value) => {
  if (!value || typeof value !== 'string') {
    return true;
  }

  const normalized = value.trim().toLowerCase();
  return normalized.startsWith('your_') || normalized.includes('placeholder');
};

export const getMissingEmailJsConfigKeys = () => {
  const missingKeys = [];

  if (looksLikePlaceholder(EMAILJS_CONFIG.SERVICE_ID)) {
    missingKeys.push('NEXT_PUBLIC_EMAILJS_SERVICE_ID');
  }

  if (looksLikePlaceholder(EMAILJS_CONFIG.PUBLIC_KEY)) {
    missingKeys.push('NEXT_PUBLIC_EMAILJS_PUBLIC_KEY');
  }

  if (looksLikePlaceholder(EMAILJS_CONFIG.TEMPLATES.PASSWORD_RESET)) {
    missingKeys.push('NEXT_PUBLIC_EMAILJS_TEMPLATE_PASSWORD_RESET');
  }

  if (looksLikePlaceholder(EMAILJS_CONFIG.TEMPLATES.WELCOME)) {
    missingKeys.push('NEXT_PUBLIC_EMAILJS_TEMPLATE_WELCOME');
  }

  return missingKeys;
};

export const isEmailJsConfigured = () => getMissingEmailJsConfigKeys().length === 0;

// Instructions for setting up EmailJS:
// 1. Go to https://www.emailjs.com/
// 2. Create an account and get your Service ID and Public Key
// 3. Create email templates for password reset and welcome emails
// 4. Set NEXT_PUBLIC_EMAILJS_* variables in your environment

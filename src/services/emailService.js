import emailjs from '@emailjs/browser';
import { EMAILJS_CONFIG, getMissingEmailJsConfigKeys, isEmailJsConfigured } from '../config/emailjs';

if (isEmailJsConfigured()) {
  emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
}

const ensureEmailJsConfig = () => {
  if (isEmailJsConfigured()) {
    return true;
  }

  const missingKeys = getMissingEmailJsConfigKeys();
  console.warn(`EmailJS is not configured. Missing/placeholder env keys: ${missingKeys.join(', ')}`);
  return false;
};

export const sendPasswordResetEmail = async (email, temporaryPassword) => {
  try {
    if (!ensureEmailJsConfig()) {
      return false;
    }

    // Try different parameter combinations that EmailJS might expect
    const templateParams = {
      to_email: email,
      to_name: email.split('@')[0],
      user_email: email, // Alternative parameter name
      recipient_email: email, // Another alternative
      email: email, // Simple parameter name
      temporary_password: temporaryPassword,
      from_name: 'Expense Management System',
      reply_to: email
    };

    await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATES.PASSWORD_RESET,
      templateParams
    );
    return true;
  } catch (error) {
    console.error('EmailJS error:', error);
    return false;
  }
};

export const sendWelcomeEmail = async (email, name, temporaryPassword) => {
  try {
    if (!ensureEmailJsConfig()) {
      return false;
    }

    const templateParams = {
      to_email: email,
      to_name: name,
      user_name: name,
      temporary_password: temporaryPassword,
      from_name: 'Expense Management System',
      reply_to: email
    };

    await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATES.WELCOME,
      templateParams
    );
    return true;
  } catch (error) {
    console.error('EmailJS error:', error);
    return false;
  }
};

import emailjs from '@emailjs/browser';
import { EMAILJS_CONFIG } from '../config/emailjs';

// Initialize EmailJS
emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);

// Test function to verify EmailJS configuration
export const testEmailJS = async () => {
  try {
    // console.log('Testing EmailJS configuration...');
    // console.log('Service ID:', EMAILJS_CONFIG.SERVICE_ID);
    // console.log('Public Key:', EMAILJS_CONFIG.PUBLIC_KEY);
    // console.log('Templates:', EMAILJS_CONFIG.TEMPLATES);
    
    // Test with a simple email
    const testParams = {
      to_email: 'test@example.com',
      to_name: 'Test User',
      message: 'This is a test email',
      from_name: 'Expense Management System'
    };
    
    // console.log('Test parameters:', testParams);
    return true;
  } catch (error) {
    console.error('EmailJS test error:', error);
    return false;
  }
};

// Debug function to test EmailJS with your actual email
export const debugEmailJS = async (testEmail = 'your-email@gmail.com') => {
  try {
    // console.log('=== EmailJS Debug Test ===');
    // console.log('Testing with email:', testEmail);
    
    const debugParams = {
      to_email: testEmail,
      to_name: 'Debug Test',
      user_email: testEmail,
      recipient_email: testEmail,
      email: testEmail,
      temporary_password: 'DEBUG123',
      from_name: 'Debug System',
      reply_to: testEmail
    };
    
    // console.log('Debug parameters:', debugParams);
    // console.log('Service ID:', EMAILJS_CONFIG.SERVICE_ID);
    // console.log('Template ID:', EMAILJS_CONFIG.TEMPLATES.PASSWORD_RESET);
    
    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATES.PASSWORD_RESET,
      debugParams
    );
    
    console.log('Debug test successful:', response);
    return true;
  } catch (error) {
    console.error('Debug test failed:', error);
    console.error('Error status:', error.status);
    console.error('Error text:', error.text);
    return false;
  }
};

export const sendPasswordResetEmail = async (email, temporaryPassword) => {
  try {
    console.log('Sending password reset email to:', email);
    // console.log('Service ID:', EMAILJS_CONFIG.SERVICE_ID);
    // console.log('Template ID:', EMAILJS_CONFIG.TEMPLATES.PASSWORD_RESET);
    
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

    console.log('Template params:', templateParams);

    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATES.PASSWORD_RESET,
      templateParams
    );

    console.log('Email sent successfully:', response);
    return true;
  } catch (error) {
    console.error('EmailJS error:', error);
    console.error('Error details:', error.text);
    console.error('Full error object:', error);
    return false;
  }
};

export const sendWelcomeEmail = async (email, name, temporaryPassword) => {
  try {
    console.log('Sending welcome email to:', email);
    
    const templateParams = {
      to_email: email,
      to_name: name,
      user_name: name,
      temporary_password: temporaryPassword,
      from_name: 'Expense Management System',
      reply_to: email
    };

    console.log('Template params:', templateParams);

    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATES.WELCOME,
      templateParams
    );

    console.log('Welcome email sent successfully:', response);
    return true;
  } catch (error) {
    console.error('EmailJS error:', error);
    console.error('Error details:', error.text);
    return false;
  }
};

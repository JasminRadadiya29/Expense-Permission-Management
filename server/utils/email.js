const EMAILJS_ENDPOINT = 'https://api.emailjs.com/api/v1.0/email/send';

const getEmailConfig = () => ({
  serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
  publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
  privateKey: process.env.EMAILJS_PRIVATE_KEY,
  passwordResetTemplateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_PASSWORD_RESET,
});

export const sendPasswordResetLinkEmail = async ({ toEmail, resetUrl }) => {
  const config = getEmailConfig();

  if (!config.serviceId || !config.publicKey || !config.passwordResetTemplateId) {
    throw new Error('Email provider is not configured. Missing EmailJS service/public key/template settings.');
  }

  const response = await fetch(EMAILJS_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      service_id: config.serviceId,
      template_id: config.passwordResetTemplateId,
      user_id: config.publicKey,
      accessToken: config.privateKey || undefined,
      template_params: {
        to_email: toEmail,
        user_email: toEmail,
        recipient_email: toEmail,
        reset_link: resetUrl,
        from_name: 'Expense Management System',
      },
    }),
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(`Email provider request failed: ${response.status} ${responseText}`);
  }

  return true;
};

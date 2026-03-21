// Email functionality moved to frontend using EmailJS
// This file is kept for backward compatibility but emails are now sent from frontend

const sendPasswordResetEmail = async (email, temporaryPassword) => {
  // Email will be sent from frontend using EmailJS
  // This function now just returns true to maintain compatibility
  console.log(`Password reset email should be sent to: ${email}`);
  // console.log(`Temporary password: ${temporaryPassword}`);
  return true;
};

export { sendPasswordResetEmail };
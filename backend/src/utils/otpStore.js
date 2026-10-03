// In-memory OTP Store with automatic expiration (10 minutes)
const otpMap = new Map();

export const setOTP = (email, otp) => {
  const cleanEmail = email.trim().toLowerCase();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 mins
  otpMap.set(cleanEmail, { otp: String(otp).trim(), expiresAt });
};

export const verifyOTP = (email, inputOtp) => {
  const cleanEmail = email.trim().toLowerCase();
  const stored = otpMap.get(cleanEmail);

  if (!stored) return false;

  if (Date.now() > stored.expiresAt) {
    otpMap.delete(cleanEmail);
    return false;
  }

  const isValid = String(stored.otp).trim() === String(inputOtp).trim();
  if (isValid) {
    otpMap.delete(cleanEmail); // Single-use OTP
  }
  return isValid;
};

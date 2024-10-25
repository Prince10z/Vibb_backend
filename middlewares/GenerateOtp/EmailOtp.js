function generateOtp() {
  const otpLength = 6;
  const otp = Math.floor(Math.random() * Math.pow(10, otpLength))
    .toString()
    .padStart(otpLength, "0");
  return otp;
}
module.exports = { generateOtp };

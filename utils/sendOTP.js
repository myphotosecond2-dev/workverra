import axios from "axios";

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOTP = async (phone, otp) => {
  console.log(`OTP for +91${phone}: ${otp}`);

  if (process.env.NODE_ENV === "development" || !process.env.MSG91_AUTH_KEY) {
    return { success: true, devMode: true };
  }

  try {
    await axios.post("https://api.msg91.com/api/v5/otp", {
      authkey: process.env.MSG91_AUTH_KEY,
      mobile: `91${phone}`,
      otp,
      otp_expiry: 10,
    });

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
};
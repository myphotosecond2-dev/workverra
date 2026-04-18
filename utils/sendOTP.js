import axios from "axios";

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOTP = async (phone, otp) => {
  console.log(`[OTP] +91${phone} → ${otp}`);

  // Only use dev mode if explicitly set AND no SMS key provided
  const hasKey = !!process.env.MSG91_AUTH_KEY;

  if (!hasKey) {
    console.warn("[OTP] MSG91_AUTH_KEY not set — running in dev mode");
    return { success: true, devMode: true };
  }

  try {
    // MSG91 OTP API v5
    const response = await axios.post(
      "https://control.msg91.com/api/v5/otp",
      {
        mobile: `91${phone}`,
        otp,
        otp_expiry: 10,
        ...(process.env.MSG91_TEMPLATE_ID && { template_id: process.env.MSG91_TEMPLATE_ID }),
      },
      {
        headers: {
          authkey: process.env.MSG91_AUTH_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data?.type === "success") {
      return { success: true };
    } else {
      console.error("[OTP] MSG91 error:", response.data);
      return { success: false, error: response.data?.message || "SMS failed" };
    }
  } catch (err) {
    console.error("[OTP] SMS send failed:", err.message);
    return { success: false, error: err.message };
  }
};

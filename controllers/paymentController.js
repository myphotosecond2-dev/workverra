import crypto from "crypto";
import razorpay from "../config/razorpay.js";
import Payment from "../models/Payment.js";
import Booking from "../models/Booking.js";

export const createOrder = async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(500).json({
        success: false,
        message: "Payment service not configured. Please try later.",
      });
    }

    const { bookingId } = req.body;
    if (!bookingId) return res.status(400).json({ message: "Booking ID is required" });

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const existingPayment = await Payment.findOne({ booking: bookingId, status: "paid" });
    if (existingPayment) return res.status(400).json({ message: "Booking already paid" });

    const order = await razorpay.orders.create({
      amount: booking.amount * 100,
      currency: "INR",
      receipt: `receipt_${booking._id}`,
    });

    const payment = await Payment.create({
      booking: booking._id,
      razorpayOrderId: order.id,
      amount: booking.amount,
      status: "pending",
    });

    return res.status(200).json({ success: true, order, paymentId: payment._id });
  } catch (error) {
    console.error("createOrder error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(500).json({
        success: false,
        message: "Payment service not configured. Please try later.",
      });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId } = req.body;

    if (!paymentId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Missing payment verification fields" });
    }

    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSign !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });
    if (payment.status === "paid") return res.status(400).json({ success: false, message: "Payment already verified" });

    payment.status = "paid";
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    await payment.save();

    await Booking.findByIdAndUpdate(payment.booking, { status: "completed" });

    return res.status(200).json({ success: true, message: "Payment successful" });
  } catch (error) {
    console.error("verifyPayment error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

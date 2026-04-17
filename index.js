import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

import authRoutes from "./routes/auth.js";
import bookingRoutes from "./routes/bookings.js";
import paymentRoutes from "./routes/payment.js";
import reviewRoutes from "./routes/reviews.js";
import workerRoutes from "./routes/workers.js";

dotenv.config();

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// Health check
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/workers", workerRoutes);

const startServer = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT;

    // ✅ IMPORTANT FIX: define server correctly
    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log("🚀 Server running on port:", PORT);
    });

    // optional safety
    server.on("error", (err) => {
      console.error("Server error:", err);
    });

  } catch (error) {
    console.error("❌ Server failed to start:", error.message);
    process.exit(1);
  }
};

startServer();
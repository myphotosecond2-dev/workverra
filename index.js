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

// ---------------- MIDDLEWARE ----------------
app.use(express.json());

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// ---------------- HEALTH CHECK ----------------
app.get("/", (req, res) => {
  res.status(200).json({ status: "API is running" });
});

// ---------------- ROUTES ----------------
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/workers", workerRoutes);

// ---------------- START SERVER ----------------
const PORT = process.env.PORT;

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log("🚀 Server running on port:", PORT);
    });

    server.on("error", (err) => {
      console.error("Server error:", err);
    });

  } catch (err) {
    console.error("❌ Startup error:", err);
    process.exit(1);
  }
};

startServer();

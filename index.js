import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

// Routes
import authRoutes from "./routes/auth.js";
import bookingRoutes from "./routes/bookings.js";
import paymentRoutes from "./routes/payment.js";
import reviewRoutes from "./routes/reviews.js";
import workerRoutes from "./routes/workers.js";

dotenv.config();

const app = express();

// ---------------- MIDDLEWARE ----------------
app.use(express.json());

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// ---------------- HEALTH CHECK ----------------
app.get("/", (req, res) => {
  res.status(200).send("API is running...");
});

// ---------------- ROUTES ----------------
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/workers", workerRoutes);

// ---------------- START SERVER SAFELY ----------------
const startServer = async () => {
  try {
    // Connect DB first
    await connectDB();

    // IMPORTANT: Railway provides PORT automatically
    const PORT = process.env.PORT;

    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log("🚀 Server running on port:", PORT);
    });

    // Safety handlers
    server.on("error", (err) => {
      console.error("Server error:", err);
    });

  } catch (error) {
    console.error("❌ Server failed to start:", error.message);
    process.exit(1);
  }
};

startServer();
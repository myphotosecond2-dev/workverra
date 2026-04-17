// index.js (Railway-compatible production server)
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

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

// Health check endpoint
app.get("/", (req, res) => {
  res.status(200).json({ status: "API is running" });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/workers", workerRoutes);

// Catch-all 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Global error handler (optional)
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Start the server using Railway's PORT environment variable
const startServer = async () => {
  try {
    await connectDB(); 
    const PORT = process.env.PORT;      // **Railway-provided port**
    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port: ${PORT}`);
    });
    server.on("error", (error) => {
      console.error("Server error:", error);
    });
  } catch (error) {
    console.error("Startup error:", error);
    process.exit(1);
  }
};
startServer();

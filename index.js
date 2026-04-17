import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

dotenv.config();

const app = express();

// middleware
app.use(express.json());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
  })
);

// connect DB
connectDB();

// test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// routes
import authRoutes from "./routes/auth.js";
import bookingRoutes from "./routes/bookings.js";
import paymentRoutes from "./routes/payment.js";
import reviewRoutes from "./routes/reviews.js";
import workerRoutes from "./routes/workers.js";

app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/workers", workerRoutes);

// port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
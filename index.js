import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

// load env variables
dotenv.config();

const app = express();

// middleware
app.use(express.json());

// allow frontend requests
app.use(
  cors({
    origin: "*", // later replace with your frontend URL
    credentials: true,
  })
);

// connect database
connectDB();

// simple route to check server
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

// port for railway
const PORT = process.env.PORT || 5000;

// start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
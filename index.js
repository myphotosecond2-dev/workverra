import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

dotenv.config();

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running");
});

const start = async () => {
  await connectDB();

  const PORT = process.env.PORT;

  app.listen(PORT, "0.0.0.0", () => {
    console.log("Server running:", PORT);
  });
};

start();
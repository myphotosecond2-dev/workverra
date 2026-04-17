import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI missing in environment");
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected:", conn.connection.host);
    return true;
  } catch (error) {
    console.error("Database connection failed:", error.message);
    throw error;
  }
};

export default connectDB;
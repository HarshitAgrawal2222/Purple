import mongoose from "mongoose";

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "greencart",
    });

    isConnected = conn.connections[0].readyState === 1;

    console.log("✅ Database Connected");
  } catch (error) {
    console.error("❌ DB Error:", error.message);
    throw error; // IMPORTANT for Vercel debugging
  }
};

export default connectDB;

import mongoose from "mongoose";

let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection) {
    return cachedConnection;
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined");
  }

  cachedConnection = mongoose
    .connect(process.env.MONGO_URI)
    .then((mongooseInstance) => {
      console.log(
        `MongoDB Connected: ${mongooseInstance.connection.host}`
      );

      return mongooseInstance;
    })
    .catch((error) => {
      cachedConnection = null;
      console.error("MongoDB connection error:", error);
      throw error;
    });

  return cachedConnection;
};

export default connectDB;
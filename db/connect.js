import mongoose from "mongoose";


export const connectDB = () => {
    const uri = process.env.MONGO_URL;
    mongoose.connect(uri)
        .then(() => console.log("MongoDB Connected..."))
        .catch((err) => console.error("MongoDB connection error:", err));
}
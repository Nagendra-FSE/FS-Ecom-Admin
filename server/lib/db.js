import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();       

export const connectDB = async () => {
    try {
       const connection = await mongoose.connect(process.env.MONGO_URI)
       console.log("mongodb connected")
    } catch (err) {
       console.log(err)
       process.exit(1)
    }
}
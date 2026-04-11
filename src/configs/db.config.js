import { config } from "dotenv";
import mongoose from "mongoose";

config({ quiet: true })

export const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL)
        return "DB Connection ✅"
    } catch {
        console.error(error)
        return "DB Connection error ❎"
    }
}
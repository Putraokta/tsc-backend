import mongoose from "mongoose";
import { env } from "./env";

const connectDB = async () => {
    try {
        await mongoose.connect(env.DATABASE_URL, {
            dbName: "db_tsc",
        });
        return Promise.resolve("Database connected successfully");
    } catch (error) {
        return Promise.reject("Failed to connect to database");
    }
}

export default connectDB;
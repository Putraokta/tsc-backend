import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import { env } from "./utils/env";
import connectDB from "./utils/database";
import router from "./routes/api";
import cookieParser from "cookie-parser";

dotenv.config();

async function init() {
  try {
    const result = await connectDB();
    console.log("Database Status", result);

    const app = express();

    app.use(
      cors({
        origin: [
          "http://localhost:3000",
          "http://192.168.18.2:3000",
        ],
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
      }),
    );

    app.use(cookieParser());
    app.use(bodyParser.json());

    const { PORT } = env;

    app.get("/", (req, res) => {
      res.status(200).json({ message: "Server is running", status: "success" });
    });

    app.use("/api/v1", router);

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
}

init();

import express, { Router } from "express";
import dotenv from "dotenv";
import router from "./routes/v1";
dotenv.config();
import cors from "cors"
const app = express();

app.use(express.json());
app.use(cors());
app.use("/api/v1", router);

const PORT = process.env.PORT || 3000;

function startServer() {
  app.listen(PORT, () => {
    console.log("App started at PORT", PORT);
  });
}

startServer();

import express, { Router } from "express"
import dotenv from "dotenv"
import authRouter from "./routes/authentication";
dotenv.config();

const app = express();
app.use(express.json());


app.use("/api/v1",authRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>{
    console.log("App started at PORT",PORT);
})
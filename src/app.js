import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    credentials: true,
  })
);
app.use(express.json({ limit: "5mb" }));
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true, limit: "5kb" }));
app.use(express.static("public"));
app.use(cookieParser());

export { app };

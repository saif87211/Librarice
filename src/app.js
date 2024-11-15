import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import session from "express-session";
import { config } from "./config/config.js";

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

app.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpsOnly: true,
      secure: false, //set true in production for https
      maxAge: 1000 * 60 * 60 * config.sessionCookieExpiry,//Miliseconds to hour
    },
  })
);
app.set("view engine", "ejs");
app.set("views", "./src/views");

app.use((req, _res, next) => {
  if (req.session.apiResponse) {
    req.session.apiResponse.data = {};
  }
  next();
});

import userRoute from "./routes/user.routes.js";
import dashboardRoute from "./routes/dashboard.routes.js";
import sectionRoute from "./routes/section.routes.js";
import studentRoute from "./routes/student.routes.js";
import bookCategoryRoute from "./routes/bookcategory.routes.js";
import bookRoute from "./routes/book.routes.js";

app.use("/", userRoute);

app.use("/dashboard", dashboardRoute);
app.use("/", sectionRoute);
app.use("/", studentRoute);
app.use("/", bookCategoryRoute);
app.use("/", bookRoute);

export { app };

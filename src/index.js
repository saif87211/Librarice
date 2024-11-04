import dotenv from "dotenv";
import { app } from "./app.js";
import dbConnect from "./db/db.js";

dotenv.config("./.env");

const port = process.env.PORT || 3000;

dbConnect()
  .then(() => {
    app.on("error", (error) => {
      console.log("Error on App: ", error);
      throw error;
    });
    app.listen(port, () =>
      console.log(`⚙ Server is hot on http://localhost:${port}`)
    );
  })
  .catch((err) => {
    console.log("Db Connecton Error: ", err);
  });

import { config } from "./config/config.js";
import { app } from "./app.js";
import dbConnect from "./db/db.js";

const port = config.port || 3000;

dbConnect()
  .then(() => {
    app.on("error", (error) => {
      console.log("Error on App: ", error);
      throw error;
    });
    app.listen(port, () =>
      console.log(`⚙ Server is hot on ${port}`)
    );
  })
  .catch((err) => {
    console.log("Db Connecton Error: ", err);
  });

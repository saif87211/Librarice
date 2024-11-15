import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";
import { config } from "../config/config.js"

const dbConnect = async () => {
  try {
    const connection = await mongoose.connect(
      `${config.mongoUrl}/${DB_NAME}`
    );
    console.log(`\n DB Connected! DB HOST: ${connection.connection.host}`);
  } catch (error) {
    console.log("Db Connection error: ", error);
    process.exit(1);
  }
};

export default dbConnect;

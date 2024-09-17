import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const dbConnect = async () => {
  try {
    const connection = await mongoose.connect(
      `${process.env.MONGODB_URL}/${DB_NAME}`
    );
    console.log(`\n DB Connected! DB HOST: ${connection.connection.host}`);
  } catch (error) {
    console.log("Db Connection error: ", error);
    process.exit(1);
  }
};

export default dbConnect;

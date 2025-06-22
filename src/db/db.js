import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
const connectDB = async () => {
  try {
    // console.log("Hello");
    console.log("Connecting to:", `${process.env.MONGODB_URI}/${DB_NAME}`);

    const conn = await mongoose.connect(
      `${process.env.MONGODB_URI}/chaiaurcode`
    );
    console.log(`mongo db connected DB HOST${conn.connection.host}`);
  } catch (error) {
    console.log("MONGODB error", error);
    process.exit(1); //is predifined function no need to import where you can exit porcess
  }
};

export default connectDB;

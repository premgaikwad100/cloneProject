//require('dotenv').config();
import dotenv from "dotenv";
import connectDB from "./db/db.js";

dotenv.config({
  path: "./.env",
});

connectDB();
/// this function now dont need below code all the code is written in db.js
// import express from "express";
// const app = express();

// (async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//     app.on("error", (error) => {
//       console.log("ERR:", error);
//       throw error;
//     });
//     app.listen(process.env.PORT, () => {
//       console.log(`App is listening${process.env.PORT}`);
//     });
//   } catch (error) {
//     console.error("ERR:", error);
//     throw error;
//   }
// })();

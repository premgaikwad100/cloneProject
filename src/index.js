//require('dotenv').config();
import dotenv from "dotenv";
import connectDB from "./db/db.js";
import { app } from "./app.js";

dotenv.config({
  path: "./.env",
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`server is running on port${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MOngo DB connection failed !!!", err);
  });

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

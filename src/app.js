// import express from "express";
// import cors from "cors";
// import cookieParser from "cookie-parser";
// const app = express();

// app.use(
//   cors({
//     origin: process.env.CORS_ORIGIN,
//   })
// );
// app.use(express.json({ limit: "16kb" })); //configuration purpose
// app.use(express.urlencoded({ extended: true, limit: "16kb" })); //configuration purpose
// app.use(express.static("public")); //configuration purpose
// app.use(cookieParser()); //conifiuration puprpose

// //route import
// import userRouter from "./routes/user.route.js";
// app.use("/api/v1/users", userRouter); //middleware is used app.post not app.use so and /api/v1/users will appended for all users request

// export { app }; //mulitple option we can export by using default also

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//routes import
import userRouter from "./routes/user.routes.js";
app.use(express.json());
//routes declaration
app.use("/api/v1/users", userRouter);

// http://localhost:8000/api/v1/users/register

export { app };

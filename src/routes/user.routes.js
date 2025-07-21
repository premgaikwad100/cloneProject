// //all user route will come here from user controller
// import { Router } from "express";
// import { registerUser } from "../controllers/user.controller.js";
// const router = Router();
// // router.route("/").post((req, res) => {
// //   res.status(200).json({ message: "Default user route working" });
// // });
// router.route("/register").post(registerUser); //when you keep controller and router separate you need to write this kind of post menthod
// //first it find in app.js and then from that it come here
// //localhost:8000//users/register        //url get appended more here   now if use register delete no need to append url always it get by default
// export default router;
import { Router } from "express";
import {
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"; //is  helpfull for adding extra functionalities
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  //actually method is registerUser but here you do all this work before method is middleware file handling for images
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

router.route("/logout").post(verifyJWT, logoutUser); //by the middleware verifyJWT you dont need to check the all things again

router.route("/refresh-token").post(refreshAccessToken);

export default router;

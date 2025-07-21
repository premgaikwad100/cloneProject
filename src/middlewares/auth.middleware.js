import { ApiErrors } from "../utils/ApiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", ""); //this is used actually for getting token from cookie if it is from mobile it doesnt has token then pass authorization bearer is removed bcz it contains bearer <token> to want token we need to replcae this
    // console.log(token);
    if (!token) {
      throw new ApiErrors(401, "unathorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); //veruify token and access token secret form env

    const user = await User.findById(decodedToken?._id).select(
      //actually find and doesnt pass the reference of pass and refreshTOken to the use
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiErrors(401, "Invalid access token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiErrors(401, error?.message || "invalid access token");
  }
});

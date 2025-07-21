import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
// const registerUser = asyncHandler(async (req, res) => {
//   res.status(200).json({
//     message: "ok",
//   });
// });

//method for acceess token and  referesh token actually used in login can be created there but it will need more times better to create funtion
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiErrors(404, "user not found");
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false }); //acutally it need all field for saving so we off that setting because we want to just save refresh token
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiErrors(500, "something went wrong while generating tokens");
  }
};

//for register
const registerUser = asyncHandler(async (req, res) => {
  //todo
  //get user deatils from postman or frontedn
  // validations
  //check if user already exists
  //check for images check for avatar
  //upload cloudinary
  //create user object create enty in DB
  //remove password and referesh token field from response
  //check for user creation
  //return res
  const { fullName, email, username, password } = req.body;
  console.log("email", email);

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "") //check the all field if any one is empty then it will fire error
  ) {
    throw new ApiErrors(400, "All field are required");
  }

  const existedUser = await User.findOne({
    //this is used to find out the if you are using same email or username again
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiErrors(400, "Email or username already existed");
  }

  //checking for avatar and coverImage
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.avatar[0]?.path;     this is okay actually but we get the error later you can read null value so you need to add classic if else bcz avatar is checked it is not checked
  if (!avatarLocalPath) {
    throw new ApiErrors(400, "avatar ifle is required");
  }

  //for coverImage
  let coverImageLocalPath; // so you add this if coverImage is emtpy it will not give you error
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath); //is used for uploading the image on cloudinary
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    //compulsory need to check whether it is uploaded on cloudinary or if not then database may be failed
    throw new ApiErrors(400, "avatar ifle is required");
  }

  //now you are inserting it in DB
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "", //basically you have not added validation for the coverImage if suppose it may not uploaded to cloudinary you may get error so add blank if nnot there
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    //select ignore basically which field you want to ignore
    "-password -refereshToken"
  );

  if (!createdUser) {
    //cehck user is created or not
    throw new ApiErrors(500, "something went wrong while registering user");
  }

  //is used for sending response at last that user is created and here we used our class ApiResponse.js file
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "user registered successfully"));
});

//for login
const loginUser = asyncHandler(async (req, res) => {
  //req body->data
  //username or email
  //find the user
  //password check
  //access and referesh token
  //send cookie
  const { email, username, password } = req.body;
  if (!(username || email)) {
    throw new ApiErrors(400, "username or email is required"); //you can loginby username or email
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    //if doesnt get username or email
    throw new ApiErrors(404, "user doesnt exists");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiErrors(401, "password doesnt match");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  ); // now you dont need to always write code for this just call the function for this to generate refresh and access tokens

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "user logged in successfully"
      )
    );
});

//for logout
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined, //undefinded token so you get logout directly
      },
    },
    {
      new: true,
    }
  );

  const options = {
    //this is for deleting cookie while logout
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  //acutally this is for to login user after token is expire it basically refersh both token and comapare again
  const incomingRefreshAccessToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshAccessToken) {
    throw new ApiErrors(401, "unathorized request");
  }
  try {
    const decodedToken = jwt.verify(
      incomingRefreshAccessToken,
      process.env.REFRESH_TOKEN_SECRET
    ); //verifies the token

    const user = await User.findById(decodedToken?._id); //if decoded or id from token
    if (!user) {
      throw new ApiErrors(401, "invalid refersh token");
    }
    if (incomingRefreshAccessToken !== user?.refreshToken) {
      //check if the token match or not if not throw erro
      throw new ApiErrors(401, "refresh token is expired or used");
    }
    const options = {
      httpOnly: true,
      secure: true,
    }; //generate new tokens
    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed "
        )
      );
  } catch (error) {
    throw new ApiErrors(401, error?.message || "invalid refresh token");
  }
});
export { registerUser, loginUser, logoutUser, refreshAccessToken };

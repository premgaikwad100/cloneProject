import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
// const registerUser = asyncHandler(async (req, res) => {
//   res.status(200).json({
//     message: "ok",
//   });
// });
const registerUser = asyncHandler(async (req, res) => {
  const { fullname, email, username, password } = req.body;
  console.log("email", email);

  if (
    [fullname, email, username, password].some((field) => field?.trim() === "") //check the all field if any one is empty then it will fire error
  ) {
    throw new ApiErrors(400, "All field are required");
  }

  const existedUser = User.findOne({
    //this is used to find out the if you are using same email or username again
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiErrors(400, "Email or username already existed");
  }

  //checking for avatar and coverImage
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.avatar[0]?.path;
  if (!avatarLocalPath) {
    throw new ApiErrors(400, "avatar ifle is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath); //is used for uploading the image on cloudinary
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    //compulsory need to check whether it is uploaded on cloudinary or if not then database may be failed
    throw new ApiErrors(400, "avatar ifle is required");
  }

  //now you are inserting it in DB
  const user = await User.create({
    fullname,
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

export { registerUser };

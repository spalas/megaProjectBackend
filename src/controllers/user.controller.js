import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model";
import { uploadOneCloudinary } from "../utils/cloudiary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  // get user information
  // validation checked
  // check if user already exists : username, email
  // check fo iamage check for avatar
  // uuload them to cloudinary , avatar name
  // create user object -create entry in db
  // remove password and refresh token fields from  reponse
  // check for user creation
  // return response

  // res.status(200).json({
  //       message: "hellow it ok "
  //   })


  const { fullname, email, username, password } = req.body
  console.log("email: ", email);
  
  // if (fullname === "") {
  //   throw new ApiError(400, "fullname is required")
  // }
  if (
    [fullname, email, username, password].some((field)=>field?.trim()==="")
  ) {
    throw new ApiError(400, "All field is required")
  }
  
 const existerUser = User.findOne({
    $or: [{username}, {email}]
 })
  if (existerUser) {
    throw new ApiError(409, "User  with email or username already exists")
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
   throw new ApiError(400, "Avatar file is required")
  }

  const avatar = await uploadOneCloudinary(avatarLocalPath)
  const coverImage = await uploadOneCloudinary(coverImageLocalPath)
  if (!avatar) { 
    throw new ApiError(400, "Avatar file is required")
  }
  
 const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage.url?.url || "",
    email,
    password,
    username : username.toLowerCase(),

 })
  const createdUser = await User.findById(user._id).select(
  "-password -refreshToken"
  )
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while  registering the user")
  }

  return res.status(201).json(
   new ApiResponse(200, createdUser, "user registered Successfully")
  )

})

export {registerUser}
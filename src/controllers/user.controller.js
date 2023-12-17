import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User} from "../models/user.model.js"
import { uploadOneCloudinary } from "../utils/cloudiary.js"
import { ApiResponse } from "../utils/ApiResponse.js";


const generateAccessAndRefreshToken = async (userId)=>{
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })
    
    return { accessToken, refreshToken }
    
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating refresh and access token" )
  }
}




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


  const { fullName, email, username, password } = req.body
  // console.log("email: ", email);
  
  // if (fullname === "") {
  //   throw new ApiError(400, "fullname is required")
  // }
  if (
    [fullName, email, username, password].some((field)=>field?.trim()===" ")
  ) {
    throw new ApiError(400, "All field is required")
  }
  
 const existerUser = await User.findOne({
    $or: [{username}, {email}]
 })
  
  
  if (existerUser) {
    throw new ApiError(409, "User  with email or username already exists")
  }

  // console.log(req.files);
  let avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required")
   }


  let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }


 

  const avatar = await uploadOneCloudinary(avatarLocalPath)
  const coverImage = await uploadOneCloudinary(coverImageLocalPath)

  if (!avatar) { 
    throw new ApiError(400, "Avatar file is required")
  }
  
 const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || " ",
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

const loginUser = asyncHandler(async (req, res) => {
  /*1.req body
    2.username or email address both we can login the user
    3. find the user
    4.checked the password
    5.access and refresh token
    6.send the cookie 
  */
  
    
  const { username, email, password } = req.body 
  console.log(email)
  
  if (!username && !email) {
    throw new ApiError(400, "Username or email is requried")
  }

 const user = await User.findOne({
    $or: [{username}, {email}]
 })
  
  if (!user) {
    throw new ApiError(404, "User not found")
    
  }
  
  const isPasswordValid = await user.isPasswordCorrect
    (password)
  
  if (!isPasswordValid) {
     throw new ApiError(401, "Invalid user password")
  }
  
  const { accessToken, refreshToken } = await
    generateAccessAndRefreshToken(user._id)
  
  const loggedInUser = await User.findById(user._id).
  select("-password -refreshToken")

  const options = {
    httpOnly: true,
    secure : true,
  }
  return res
    .status(200)
    .cookie("access_token", accessToken, options)
    .cookie("refresh_token", refreshToken, options)
    .json(
      new ApiResponse(
        200, {
          user: loggedInUser, accessToken, refreshToken
      },
        "User logged  in Successfully"
      )
    )

})

const logoutUser = asyncHandler(async(req, res) => {
  await User.findByIdAndUpdate(
      req.user._id,
      {
          $set: {
              refreshToken: undefined
          }
      },
      {
          new: true
      }
  )

  const options = {
      httpOnly: true,
      secure: true
  }

  return res
  .status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

  if (incomingRefreshToken) {
      throw new ApiError(401, "unauthorized request")
  }

  try {
      const decodedToken = jwt.verify(
          incomingRefreshToken,
          process.env.REFRESH_TOKEN_SECRET
      )
  
      const user = await User.findById(decodedToken?._id)
  
      if (!user) {
          throw new ApiError(401, "Invalid refresh token")
      }
  
      if (incomingRefreshToken !== user?.refreshToken) {
          throw new ApiError(401, "Refresh token is expired or used")
          
      }
  
      const options = {
          httpOnly: true,
          secure: true
      }
  
      const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
  
      return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
          new ApiResponse(
              200, 
              {accessToken, refreshToken: newRefreshToken},
              "Access token refreshed"
          )
      )
  } catch (error) {
      throw new ApiError(401, error?.message || "Invalid refresh token")
  }

})


export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken
}
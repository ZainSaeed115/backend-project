import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import User from "../models/users.model.js"
import {uploadFileOnCloudinary} from "../utils/cloudinary.js"
import jwt from "jsonwebtoken"


// to generate accees  and refresh Tokens
const generateAccessAndRefreshTokens= async (userId)=>{
 try {
    const user= await User.findById(userId)
    const accessToken= user.generateAccessToken()
    const refreshToken=user.generateRefreshToken()
    user. refreshToken=refreshToken
     await user.save({validateBeforeSave:false})

    return{accessToken,refreshToken}
 } catch (error) {
   throw new ApiError(500,"Something went wrong while generating access and refresh token")
 }
}



// user registeration
const registerUser= asyncHandler(async (req,res)=>{
  // get user details
  // validation-not empty
  // check if user already exist:userName,email
  // check for images or check for avatar
  // upload them to cloudinary,avatar
  // create  user object-create entry in db
  // remove password and refresh token field
  // check for user creation
  // return res


  // get user data
  const {fullName,email,userName,password}=req.body
  console.log("email:",email)

  // check validatin
  if([fullName,email,userName,password].some((field)=>field?.trim()=="")){

    throw new ApiError(400,"All fields are required")
  }


  //check if user exist
  const userExisted= await User.findOne({
    $or:[{userName},{email}]
  })

  if(userExisted){
    throw new ApiError(409,"User with userName or email already exists ");
     }
    
   // check for avatar  
   console.log('req.files:', req.files);
   const avatarLocalPath=req.files?.avatar[0]?.path;
   let coverImageLocalPath;

  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
     coverImageLocalPath=req.files.coverImage[0].path;  
  }

   if(!avatarLocalPath){
      throw new ApiError(400,"Avatar File is Required")
   }
 // upload file on cloudinary
 const avatar= await uploadFileOnCloudinary(avatarLocalPath)
 const coverImage= await uploadFileOnCloudinary(coverImageLocalPath)

 if(!avatar){
    throw new ApiError(400,"Avatar File is Required")
 }

 // create user object
 const user= await User.create({
    fullName,
    avatar:avatar.url,
    coverImage:coverImage?.url || "",
    email,
    userName:userName.toLowerCase(),
    password
  })

  const createdUser= await User.findById(user._id).select(
    "-password -refreshToken"
  )

  if(!createdUser){
    throw new ApiError(500,"Something went Wrong by Registering User")
  }

  return res.status(201).json(
    new ApiResponse(200,createdUser,"User Created Successfully")
  )

})

// user log in

const loginUser=asyncHandler(async (req,res)=>{


  //req body->data
  // userName or email
  // find the user
  // check password
  // access token and refresh token
  // send cookie

  const {userName,email,password}= req.body

  if(!(userName || email)){
    throw new ApiError(400,"userName or email required")
  }

  const user= await User.findOne({
     $or:[{userName},{email}]
  })


  if(!user){
    throw new ApiError(404,"User does not exist")
  }

 const isPasswordValid= await user.isPasswordCorrect(password)

 if(!isPasswordValid){
  throw new ApiError(401,"Invalid User Credentials")
   }

  const {accessToken,refreshToken}= await generateAccessAndRefreshTokens(user._id) 

  console.log("accessToken:", accessToken);  // Add logging
  console.log("refreshToken:", refreshToken);  // Add logging
  const loggedInUser= await User.findById(user._id).select("-password -refreshToken")

  const options={
    httpOnly:true,
    secure:true,
  }

  return res
  .status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",refreshToken,options)
  .json(
    new ApiError(200,{
      user:loggedInUser,accessToken,refreshToken
    },
    "User LoggedIn Successfully"
  )
    
  )



})

// user log out

const logoutUser= asyncHandler(async (req,res)=>{
    User.findByIdAndUpdate(
      req.user._id,
      {
        $set:{
            refreshToken:undefined
        }
      },
      {
        new:true
      }
    )
    const options={
      httpOnly:true,
      secure:true,
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json({
       success:true,
       message:"User Loggedout"
    })
  
})


const refreshAccessToken=asyncHandler(async (req,res)=>{
 const incommingRefreshTooken=req.cookies.refreshTokens || req.body.refreshToken

 if(!incommingRefreshTooken){
  throw new ApiError(401,"UnAuthorized Request")
 }
try {
  
   const decodedToken=jwt.verify(
    incommingRefreshTooken,
    process.env.REFRESH_TOKEN_SECRET
   )
  
   const user= await User.findById(decodedToken?._id)
  
   if(!user){
    throw new ApiError(401,"Ivalid User refresh token")
   }
  
   if(incommingRefreshTooken!==user?.refreshToken){
    throw new ApiError(401,"Refresh Token is expired or used")
   }
  
   const options={
    httpOnly:true,
    secure:true,
  }
  
  const{accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id)
  
  return res
  .status(200)
  .cookie("access Token",accessToken,options)
  .cookie("refresh Token",refreshToken,options)
  .json(
    new ApiResponse(
      200,
      {
        accessToken,
        refreshToken
      },
      "Access Token Refreshed"
  
    ))
} catch (error) {
  throw new ApiError(401,error?.message || "Invalid Refresh Token")
}



})








export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken
}
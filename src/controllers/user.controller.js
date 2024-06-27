import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import User from "../models/users.model.js"
import {uploadFileOnCloudinary} from "../utils/cloudinary.js"

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



export {registerUser}
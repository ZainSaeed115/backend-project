import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret:process.env.CLOUDINARY_API_SECRET // Click 'View Credentials' below to copy your API secret
})

const uploadFileOnCloudinary= async (localFilePath)=>{
  try {
    if(!localFilePath) return null

    // upload file 

   const response= await cloudinary.uploader.upload(localFilePath,{
        resource_type:"auto"
    })
    // file submited successfully on cloudinary
    console.log("ile submited successfully on cloudinary",response.url)
    return response
  } catch (error) {
    //removed the localy saved temporary file as the upload operation got failed

     fs.unlinkSync(localFilePath) 
     return null
  }
}


export {uploadFileOnCloudinary}
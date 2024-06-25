import {asyncHandler} from "../utils/asyncHandler.js"


const registerUser= asyncHandler(async (req,res)=>{
    res.status(200).json({
        message:"OK"
    })
})


const loginUser= asyncHandler(async (req,res)=>{
    res.status(200).json({
        message:"Login Successfully"
    })
})
export {registerUser,loginUser}
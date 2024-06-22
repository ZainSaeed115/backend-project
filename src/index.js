
import express from "express"
import dotenv from "dotenv"
import connectDB from "./db/db.js";

const app=express();
dotenv.config({
    path:'./env'
});

const Port=process.env.PORT || 8000

connectDB()

.then(()=>{
    app.listen(Port,()=>{
        console.log(`Server is running on Port:${Port}`)
    })

    app.on("Error",(error)=>{
        console.log(`Error:${error}`)
    })
})
.catch((error)=>{
  console.log("MongoDb Connection Failed",error)
})


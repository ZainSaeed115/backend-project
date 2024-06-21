
import express from "express"
import dotenv from "dotenv"
import connectDB from "./db/db.js";

const app=express();
dotenv.config({
    path:'./env'
});

connectDB();


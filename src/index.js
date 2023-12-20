
import dotenv from "dotenv"
import mongoose from "mongoose";
import express from "express";
import { DB_NAME } from "./constants.js";
import connectDB from "./db/index.js"
dotenv.config({
    path:'./env'
})
//Apporch:::1



dotenv.config({
    path:'./env'
})


 connectDB()



//Approch 2:
// const app = new express()


//     // function connectDB(){}
//     // connectDB()
//     ; (async () => {
//         try {
//             await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//             app.on("error", (error) => {  // it is a error event
//                 console.log("error unable to connet to database", error);
//                 throw error
//             })
//             app.listen(process.env.PORT, () => {  // it is listhenning event
//                 console.log(`app is listening at ${process.env.PORT}`);

//             })
//         } catch (error) {
//             console.log("ERROR in CONNECTION", error);
//             throw error;
//         }
//     })()    // semicolon is used for cleaning  
    
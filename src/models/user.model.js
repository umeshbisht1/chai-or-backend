import { Schema } from "mongoose";
import mongoose from "mongoose";
import bcrypt from "bcrypt"
import  Jwt  from "jsonwebtoken";

// const userschema=new mongoose.Schema({},{timestamps:true})
const userschema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,

    },
    fullname: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    avatar: {
        type: String,// url of cloudnary
        required: true,

    },
    coverimage: {
        type: String,// url of cloudnary


    },
    watchhistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        },
    ],
    password: {
        type: String,
        required: [true, "passward is required"],
    },
    refreshToken: {
        type: String,
    }



}, { timestamps: true })
/*
The use method is primarily used to load middleware functions in an Express application. 
Middleware functions are functions that have access to the request object (req), the response object (res), 
and the next middleware function in the application's request-response cycle.

*/



userschema.pre("save",async function(next){
    if(this.isModified("password")){
   this.password= await bcrypt.hash(this.password,10)  // it takes towo thing passward and saltround to encrypt
    }
    next();
})
userschema.methods.isCorrect = async function(password)
{
   return await bcrypt.compare(password,this.password)
}
userschema.methods.generateaccesstoken=function(){        // jwt is barrier token it is like a key
   return  Jwt.sign(      //In the context of web development, APIs, and security, the term "payload" usually refers to the data that is transmitted as part of a request or response in a communication protocol. It is the actual content of the message.
        {
            _id:this._id,
            email:this.email,
            username:this.username,
            fullname:this.fullname,
        },
        process.env.ACCESS_TOKEN_SECRET,    // access token
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY   // expiry time
        }

    )
}
userschema.methods.generaterefreshtoken=function(){
    return  Jwt.sign(
        {
            _id:this._id,
           
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const User = mongoose.model("User", userschema);
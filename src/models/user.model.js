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
    avater: {
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

userschema.pre("save",async function(next){
    if(this.isModified("passward")){
   this.password= await bcrypt.hash(this.password,10)  // it takes towo thing passward and saltround to encrypt
    }
    next();
})
userschema.methods.ispasswardCorrect=async function(passward)
{
   return await bcrypt.compare(passward,this.passward)

}
userschema.methods.generateaccesstoken=function(){
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
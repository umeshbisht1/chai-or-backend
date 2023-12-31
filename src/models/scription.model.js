import mongoose from "mongoose";
const subscriptionschema= new mongoose.Schema({
  subscriber:{
    type:mongoose.Schema.Types.ObjectId,  // one who is suscribtion
    ref:"User"
  },
  channel:{
    type:mongoose.Schema.Types.ObjectId,  // one whom is suscribtion
    ref:"User"
  },

},{timeStamps:true})
export const Subscription=mongoose.model("Subscription",subscriptionschema)

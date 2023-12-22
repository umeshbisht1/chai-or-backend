import { Schema } from "mongoose"
import mongoose  from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"
const videoschema=new Schema({
videofile:{
    type:String,// cloudnery
    required:true,

},
thumbnail:{
    type:String,
    required:true,
},

tittle:{
    type:String,
    required:true,
},

discription:{
    type:String,
    required:true,
},

duration:{
    type:Number,   
    required:true,
},
views:{
    type:Number,
    default:0,
},
isPublished:{
    type:Boolean,
    default:true,
},
owner:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
}

},{timestamps:true})

videoschema.plugin(mongooseAggregatePaginate)


export const Video=mongoose.model("Video",videoschema)
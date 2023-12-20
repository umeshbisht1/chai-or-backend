import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
const connectDB = async()=>{
    try {
        const connectinsatnce = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n Mongodb connected !! DB HOSTED ${connectinsatnce.connection.host}`);
    } catch (error) {
        console.log("error in connecteing to mongodb how can i handle",error);
        process.exit(1);
    }
}
export default connectDB;
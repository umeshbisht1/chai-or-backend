import { apierror } from "../utils/apierror.js";
import jwt from "jsonwebtoken"
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const token = req.cookies?.accessToken || (req.headers.authorization && req.headers.authorization.replace("Bearer ", ""));
    if (!token) {
      throw new apierror(401, "Unauthorized: Missing Token");
    }
  
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded?._id).select("-password -refreshToken");
    
    if (!user) {
      throw new apierror(401, "Unauthorized: Invalid Access Token");
    }
  
    req.user = user;
    console.log(user);
    next();
  } catch (error) {
    // Include the original error as a property of the new error
    throw new apierror(401, "Unauthorized: Something went wrong  i think u are not logged in the website", error);
  }
  
})

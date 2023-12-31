import { Router } from "express";
import  {registerUser, loginUser, logoutUser, refreshaccessToken, changeCurrentPassword, getCurrentuser, updateaccount, updateuseravatar, updateusercoverimage, getuserChannelProfile, watchhistoryofuser } from "../controller/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import multer from "multer";
const router=Router();

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1,
        }
        ,{
           name:"coverimage",
           maxCount:1,
        }
    ]),
    registerUser)
    router.route("/login").post(loginUser);
    router.route("/logout").post(verifyJWT,logoutUser)
    router.route("/refresh_Token").post(refreshaccessToken)
    router.route("/change-password").post(verifyJWT,changeCurrentPassword);
    router.route("/current-user").get(verifyJWT,getCurrentuser);
    router.route("/updateaccount-details").patch(verifyJWT,updateaccount);
    router.route("/updateavatar").patch(verifyJWT,upload.single("avatar"),updateuseravatar)
    router.route('/updatecoverimage').patch(verifyJWT,upload.single("coverimage"),updateusercoverimage);
    router.route("/c/:username").get(verifyJWT,getuserChannelProfile);
    router.route("/watchhistory").get(verifyJWT,watchhistoryofuser);

export default router;

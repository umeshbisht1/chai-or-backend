import { asyncHandler } from '../utils/asyncHandler.js'
import { apierror } from "../utils/apierror.js"
import { User } from '../models/user.model.js'
import { cloudinaryupdate } from '../utils/cloudnery.js'
import { apiresponse } from '../utils/apiresponse.js'
const registerUser = asyncHandler(async (req, res) => {
    // get user deatils for frontend details::
    // validation::->empty??
    //check if user already exixts:: with the help of user namr and email:
    //cheeck for image and avatar
    // upload to clooudnary   avatr check 
    // create a user object- create a entry in db
    // remove the passward and referesh token feild:
    // check the response has come or not::

    //return response  otherwise error::
    const { username = "", email = "", fullname = "", password = "" } = req.body
    console.log("email ::", email, fullname, username);
    if (fullname === "") {
        throw new apierror(400, "full name is required")
    }
    if (username === "") {
        throw new apierror(400, "username is required")
    }
    if (email === "") {
        throw new apierror(400, "email is required")
    }
    if (password === "") {
        throw new apierror(400, "password is required")
    }


    if (
        [fullname, username, email, password].some((feild) => feild?.trim() === "")
    ) {
        throw new apierror(400, "all feid are required")
    }

    const existuser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (existuser) {
        throw new apierror(409, "user with email already exists")
    }
    //console.log(req.files);
    //const avtarlocalpath = req.files?.avatar[0]?.path;
    //const coverimagepath = req.files?.coverimage[0]?.path;
    let avtarlocalpath;
    let coverimagepath;
    if (req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0) {
        avtarlocalpath = req.files?.avatar[0]?.path;
    }
    if (req.files && Array.isArray(req.files.coverimage) && req.files.coverimage.length > 0) {
        coverimagepath = req.files?.coverimage[0]?.path;
    }
    if (!avtarlocalpath)
        throw new apierror(400, "avtar image required")
    const avatar = await cloudinaryupdate(avtarlocalpath);
    const coverimage = await cloudinaryupdate(coverimagepath);
    if (!avatar) {
        throw new apierror(400, "avtar image required")
    }
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverimage: coverimage?.url || "",
        email,
        password,
        username: username.toLowerCase(),
    })
    const created_user = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if (!created_user)
        throw new apierror(500, "something went wrong during creating the account")

    return res.status(201).json(new apiresponse(200, created_user, "registered successfully"))


})
export default registerUser;

import { asyncHandler } from '../utils/asyncHandler.js'
import { apierror } from "../utils/apierror.js"
import { User } from '../models/user.model.js'
import { cloudinaryupdate } from '../utils/cloudnery.js'
import { apiresponse } from '../utils/apiresponse.js'

const generateaccesstoken_and_refreshtoken = async (userId) => {
    try {
        const user = await User.findById(userId)

        const accessToken = user.generateaccesstoken()
        const refreshToken = user.generaterefreshtoken()
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false })
        return { refreshToken, accessToken }

    } catch (error) {
        throw new apierror(500, "something went wrong while generationg the access and refereh token")
    }
}



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


    // if (
    //     [fullname, username, email, password].some((feild) => feild?.trim() === "")
    // ) {
    //     throw new apierror(400, "all feid are required")
    // }

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
const loginUser = asyncHandler(async (req, res, next) => {
    const { username, email, password } = req.body;
    //console.log(username,email,password);
    if (!(username || email))
        throw new apierror(401, "enter the username and email")
    const user = await User.findOne({
        $or: [{ username }, { email }]
    })
    //console.log(user._id);
    if (!user)
        throw new apierror(401, "you are not a valid user")
    const checkpassward = await user.isCorrect(password)
    if (!checkpassward)
        throw new apierror(402, "enter the valid password")
    const { refreshToken,accessToken } = await generateaccesstoken_and_refreshtoken(user._id)
    const loginneduser =  await User.findById(user._id).select("-password -refreshToken")
    // const {accessToken, refreshToken} = await generateaccesstoken_and_refreshtoken(user._id)

    // const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true,
    };
    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new apiresponse(
                200, 
                {
                    user: loginneduser, accessToken, refreshToken
                },
                "User logged In Successfully"
            )
        )
})
// const loginUser = asyncHandler(async (req, res) =>{
//     // req body -> data
//     // username or email
//     //find the user
//     //password check
//     //access and referesh token
//     //send cookie

//     const {email, username, password} = req.body
//     console.log(email);

//     if (!username && !email) {
//         throw new apierror(400, "username or email is required")
//     }
    
//     // Here is an alternative of above code based on logic discussed in video:
//     // if (!(username || email)) {
//     //     throw new ApiError(400, "username or email is required")
        
//     // }

//     const user = await User.findOne({
//         $or: [{username}, {email}]
//     })

//     if (!user) {
//         throw new apierror(404, "User does not exist")
//     }

//    const isPasswordValid = await user.isCorrect(password)

//    if (!isPasswordValid) {
//     throw new apierror(401, "Invalid user credentials")
//     }

//    const {accessToken, refreshToken} = await generateaccesstoken_and_refreshtoken(user._id)

//     const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

//     const options = {
//         httpOnly: true,
//         secure: true
//     }

//     return res
//     .status(200)
//     .cookie("accessToken", accessToken, options)
//     .cookie("refreshToken", refreshToken, options)
//     .json(
//         new apiresponse(
//             200, 
//             {
//                 user: loggedInUser, accessToken, refreshToken
//             },
//             "User logged In Successfully"
//         )
//     )

// })

const logoutUser = asyncHandler(async (req, res) => {
    const options = {
                httpOnly: true,
                secure: true
            }
            const updatedUser={refreshToken:undefined}
    const user = User.findByIdAndUpdate(req.user._id, updatedUser ,{ new: true });


    return res.status(200).clearCookie('accessToken', options).clearCookie('refreshToken',  options).json(new apiresponse(200, "u are logged out"));

})
export { registerUser, loginUser, logoutUser };

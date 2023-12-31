import { asyncHandler } from '../utils/asyncHandler.js'
import { apierror } from "../utils/apierror.js"
import { User } from '../models/user.model.js'
import { cloudinaryupdate } from '../utils/cloudnery.js'
import { apiresponse } from '../utils/apiresponse.js'
import jwt from "jsonwebtoken"
import mongoose from 'mongoose'

const generateaccesstoken_and_refreshtoken = async (userId) => {
    try {
        const user = await User.findById(userId)

        const accessToken = user.generateaccesstoken()
        const refreshToken = user.generaterefreshtoken()
        //console.log(refreshToken);
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
    console.log(user);
    if (!user)
        throw new apierror(401, "you are not a valid user")
    const checkpassward = await user.isCorrect(password)
    if (!checkpassward)
        throw new apierror(402, "enter the valid password")
    const { refreshToken, accessToken } = await generateaccesstoken_and_refreshtoken(user._id)
    const loginneduser = await User.findById(user._id).select("-password -refreshToken")
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
    const updatedUser = { refreshToken: undefined }
    const user = User.findByIdAndUpdate(req.user._id, updatedUser, { new: true });


    return res.status(200).clearCookie('accessToken', options).clearCookie('refreshToken', options).json(new apiresponse(200, "u are logged out"));

})
const refreshaccessToken = asyncHandler(async (req, res) => {
    const incomingrefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingrefreshToken)
        throw new apierror(401, "unauthorized request")

    try {
        const decodedToken = jwt.verify(incomingrefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
        const user = await User.findById(decodedToken?._id);
        console.log(user);
        if (!user)
            throw new apierror(401, "invalid refresh token")
        if (incomingrefreshToken !== user.refreshToken)
            throw new apierror(401, "refrseh token is expired or used")
        const options = {
            httpOnly: true,
            secure: true,
        }

        const { accessToken, refreshToken } = await generateaccesstoken_and_refreshtoken(user._id);
        console.log(refreshToken);
        return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(new apiresponse(200, {
                accessToken, refreshToken,
            }, "access token  refreshed"))
    } catch (error) {
        throw new apierror(401, error.message || "refreshed again")
    }
})
const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldpassword, newpassword } = req.body;
    console.log(req.user._id);

    const user = await User.findById(req.user._id);
    console.log("i am the user", user);
    if (!user)
        throw new apierror(400, "not a valid user in in changepassword")

    const check = await user.isCorrect(oldpassword)
    //const check=true;
    if (!check)
        throw new apierror(400, "invalid old password")
    user.password = newpassword;
    await user.save({ validateBeforeSave: false })
    return res.status(200).
        json(new apiresponse(200, "passwaord cahnged successfully buddy"))
})
const getCurrentuser = asyncHandler(async (req, res) => {
    return res.status(200).json(new apiresponse(200, req.user, "current user succesfully"))
})
const updateaccount = asyncHandler(async (req, res) => {
    const { fullname, email } = req.body;
    console.log(fullname,email);
    if (!fullname && !email)
        throw new apierror(400, "all feild are required")
    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                fullname: fullname,
                email,
            },
        },
        {
            new: true,
        }
    ).select("-password -refreshToken");
    
   console.log(user);
    return res.status(200).json(new apiresponse(200, "account have updated successfully"));

})
const updateuseravatar = asyncHandler(async (req, res) => {
    const avatarlocalpath = req.file?.path
    if (!avatarlocalpath)
        throw new apierror(400, "avtar file is missing")
    const avatar = await cloudinaryupdate(avatarlocalpath)
    if (!avatar.url)
        throw new apierror(400, "api error while upadating on avatar")
    const user = await User.findByIdAndUpdate(req.user?._id, {
        $set: {
            avatar: avatar.url,
        }
    }, {
        new: true,
    }).select("-password");
    return res.status(200).
        json(new apiresponse(200, user, "avatar image upadated"))
})
const updateusercoverimage = asyncHandler(async (req, res) => {
    const coverlocalpath = req.file?.path
    if (!coverlocalpath)
        throw new apierror(400, "cover file is missing")
    const cover = await cloudinaryupdate(coverlocalpath)
    if (!cover.url)
        throw new apierror(400, "api error while upadating on avatar")
    const user = await User.findByIdAndUpdate(req.user?._id, {
        $set: {
            coverimage: cover.url,
        }
    }, {
        new: true,
    }).select("-password");
    return res.status(200).
        json(new apiresponse(200, user, "cover image upadated"))
})
const getuserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params
    if (!username?.trim()) {
        throw new apierror(400, "username is missing")

    }
    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        }, {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribed_to"
            }
        },
        {
            $addFields: {
                subsciberscount: {
                    $size: "$subscribers"
                },
                channelsubscribedToCount: {
                    $size: "$subscribed_to"
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false,
                    }
                }
            }
        },
        {
            $project: {
                fullname: 1,
                username: 1,
                subsciberscount: 1,
                channelsubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverimage: 1,
                email: 1,
            }
        }
    ])

    console.log( "umesh bisht channel is here",channel);
    if (channel?.length) {
        throw new apierror(404, "channel does not exixts bawa")
    }
    return res.status(200).json(new apiresponse(200, channel[0], "channel fetched successfully"))

})
const watchhistoryofuser = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        }, {
            $lookup: {
                from: "videos",
                localField: "watchhistory",
                foreignField: "_id",
                as: "watchhistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullname: 1,
                                        username: 1,
                                        avatar: 1,
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            },

        }
    ])
    console.log();
    return res.status(200).json(new apiresponse(200, user[0].watchhistory, "watchhistory fetched successfully:"))
})
export {
    registerUser, loginUser, logoutUser, refreshaccessToken, changeCurrentPassword, getCurrentuser,
    updateaccount, updateuseravatar, updateusercoverimage, getuserChannelProfile, watchhistoryofuser
};

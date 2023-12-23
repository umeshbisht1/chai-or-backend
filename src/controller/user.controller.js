import {asyncHandler} from '../utils/asyncHandler.js'
const registerUser=asyncHandler(async(req,res)=>{
     res.status(200).json({
        message:"done ho gya fir"
    })
})
export default registerUser;
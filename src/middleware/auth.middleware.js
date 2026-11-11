const userModel=require("../models/user.model")
const tokenModel=require("../models/tokenblacklisting.model")
const config=require("../config/config")
const jwt=require("jsonwebtoken")

const authmiddleware=async(req,res,next)=>{

    try{
        
        const token =req.cookies.Jwt_Token || req.headers.authorization?.split(" ")[1]
        const refreshToken =req.cookies.refreshToken || req.headers.authorization?.split(" ")[1]

     if (!token){
        return res.status(401).json({
            message:"unauthorized access ,token is missing"
        })
     }

    const isBlackListed= await tokenModel.findOne({token})

    if (isBlackListed){
            return res.status(401).json({
                message:"unauthorized access ,token is invalid"
            })
        }



    const decoded =jwt.verify(token,config.JWT_SECRET)
    const user = await userModel.findById(decoded.userId)


    if(!user){
         return res.status(400).json({
            message:"user not found"
        })
    }

    req.user=user 

    req.token=token 
    req.refreshToken=refreshToken 
  

    next()
    
    } catch (error) {
    return res.status(401).json({
      message: "Unauthorized access, token is invalid or expired",
    });
  }

}


module.exports={
    authmiddleware
}
const userModel=require("../models/user.model")
const config=require("../config/config")
const jwt =require('jsonwebtoken')
const tokenModel=require("../models/tokenblacklisting.model")

exports.userRegisterController= async(req,res)=>{

    const {name,email,password} =req.body;

    const IsAlreadyRegistered=await userModel.findOne({email})
    
    if(IsAlreadyRegistered){
        return res.status(422).json({
            message:"user Already Exists With Email",
            status:"failed"
        })
    }

    const user =await userModel.create({
        name,email,password
    })

    const token = jwt.sign(
        {userId:user._id},
        config.JWT_SECRET,
        {expiresIn:"15m"}
    )


      const refreshToken = jwt.sign(
        {userId:user._id},
        config.JWT_REFRESH_SECRET,
        {expiresIn:"3d"}
    )


    res.cookie("Jwt_Token",token)
    res.cookie("refreshToken",refreshToken)


    res.status(201).json({
        message:"user created succesfully",
        user:{
            id:user._id,
            username:user.name,
            email:user.email,
        },
        token
    })
}

exports.userLoginController= async(req,res)=>{

    const {email,password} =req.body;

    const user=await userModel.findOne({email}).select("+password");
    
    if(!user){
        return res.status(401).json({
            message:"Email or password is not valid",
            status:"failed"
        })
    }

    console.log("Request password:", password);

    const isValid=await user.comparePasswords(password)

      if(!isValid){
        return res.status(401).json({
            message:"Email or password is not valid",
            status:"failed"
        })
    }

    const token = jwt.sign(
        {userId:user._id},
        config.JWT_SECRET,
        {expiresIn:"15m"}
    )

    const refreshToken = jwt.sign(
        {userId:user._id},
        config.JWT_REFRESH_SECRET,
        {expiresIn:"3d"}
    )


    res.cookie("Jwt_Token",token)
    res.cookie("refreshToken",refreshToken)


    res.status(200).json({
        message:"user login succesfully",
        user:{
            id:user._id,
            username:user.name,
            email:user.email,
        },
        token
    })
}

// exports.forgetPasswordController=async(req,res)=>{

// }
exports.userLogoutController=async(req,res)=>{

     const token=req.token
     console.log(token)

     res.clearCookie("Jwt_Token");

     await tokenModel.create({
        token:token
     })

    return res.status(200).json({
            message:"user Logout Successfully"
        })



}

exports.getMeController=async(req,res)=>{
    const user=req.user;


    res.status(200).json({
        message:"user featched Successfully",
        user
    })
}

exports.refreshTokenController=async(req,res)=>{
    const user=req.user;

    const refreshToken = req.cookies.refreshToken || req.headers.authorization?.split(" ")[1]

    if(!refreshToken){
        res.status(401).json({
            message:"refresh Token Is Missing"
        })
    }

    const decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET)

    if(!decoded){
        res.status(401).json({
            message:"Refresh Token Is Invalid"
        })
    }

    const token=Jwt.sign(
        {userId:user._id},
        config.JWT_SECRET,
        {expiresIn:"15m"}
    )
    const newRefreshToken=Jwt.sign(
        {userId:user._id},
        config.JWT_REFRESH_SECRET,
        {expiresIn:"3d"}
    )

    res.cookie("JWT_SECRET",token)
    res.cookie("refreshToken",newRefreshToken)

    res.status(200).json({
        message:"Token Refreshed Successfully",
        token,
        refreshToken:newRefreshToken
    })

}


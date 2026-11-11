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
    
    res.cookie("refreshToken",refreshToken,{
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 3 * 24 * 60 * 60 * 1000,
    })



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

exports.userLogoutController=async(req,res)=>{

     const {token,refreshToken}=req


    res.clearCookie("Jwt_Token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    //  await tokenModel.create({
    //     token:token
    //  })

    //  await tokenModel.create({
    //     token:refreshToken
    //  })

     const tokensToRevoke = [token, refreshToken].filter(Boolean);

    if (tokensToRevoke.length > 0) {
      await tokenModel.insertMany(
        tokensToRevoke.map((token) => ({
          token: token, 
        }))
      );
    }

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
    const refreshToken = req.cookies?.refreshToken;

    if(!refreshToken){
        return res.status(401).json({
            message:"Refresh token is missing"
        });
    }

    let decoded;
    try {
        decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET);
    } catch (error) {
        return res.status(401).json({
            message:"Refresh token is invalid or expired"
        });
    }

    if(!decoded?.userId){
        return res.status(401).json({
            message:"Refresh token is invalid"
        });
    }

    const user = await userModel.findById(decoded.userId);

    if(!user){
        return res.status(401).json({
            message:"Refresh token is invalid"
        });
    }

    const token = jwt.sign(
        {userId:user._id},
        config.JWT_SECRET,
        {expiresIn:"15m"}
    );
    const newRefreshToken = jwt.sign(
        {userId:user._id},
        config.JWT_REFRESH_SECRET,
        {expiresIn:"3d"}
    );

    res.cookie("Jwt_Token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 3 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
        message:"Token refreshed successfully",
        token
    });
}

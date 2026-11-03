const {uploadFile,deleteFile} =require("../services/cloudinary.service")
const userModel=require("../models/user.model")

exports.updateProfileController=async(req,res)=>{
    const user=req.user;

    const { name , email }=req.body || {};
    const profilePicture =req.file

    if(!name?.trim() && !email?.trim() && !profilePicture){
        return res.status(400).json({
            message:"you have to update the fields"
        })
    }

    let result=null;

    if(profilePicture){     
        result=await uploadFile(profilePicture.buffer)

        if(!result?.secure_url){
            return res.status(500).json({
            message:"Error in uploading Profile Picture"
        })
        }
       
    }else{

        if(user?.public_id){
            result=await deleteFile(user?.public_id)

            if(!result){
                return res.status(500).json({
                message:"Error in deleting Profile Picture"
            })
            }
        }

    }


 const updatedProfile=await userModel.findByIdAndUpdate(
        user._id ,
        {
       ...(name && { name:name }),
       ...(email && { email: email }),
       ...(profilePicture && {profilePicture: result.secure_url, public_id:result.public_id }),
       ...(!profilePicture && {profilePicture: null, public_id:null }),
        },
        {
            new: true,
            runValidators: true
        }
    
    )


    res.status(200).json({
        message:"user updated Successfully",
        user:updatedProfile
    })
}

exports.profilePictureController=async(req,res)=>{
    try{
        
    const user = req.user
    const profile = req.file

    if(!profile){
        return res.status(400).json({
            message:"profile picture is required"
        })
    }

    const result =await uploadFile(req.file.buffer)

      if (!result?.secure_url) {
            return res.status(500).json({
                success: false,
                message: "Error uploading profile picture"
            });
        }

    const updatedProfile=await userModel.findByIdAndUpdate(
        user._id ,
        {
        $set: {
            profilePicture: result.secure_url,
            public_id:result.public_id
        }
        },
        {
            new: true,
            runValidators: true
        }
    
    )

    res.status(200).json({
            message:"profile picture uploaded Successfully",
            updatedProfile
    })
}catch (error) {
    console.error("Error:", error);

    return res.status(500).json({
        success: false,
        message: error.message || "Internal server error"
    });

}
}

exports.deleteProfilePictureController=async(req,res)=>{
    const user = req.user


    if(user.profilePicture===null || user.public_id===null){
        return res.status(400).json({
            message:"No profile picture found to delete"
        })
    }

    const result=await deleteFile(user.public_id);

    if(!result){
         return res.status(500).json({
            message:"Error in deleting profile picture"
        })
    }
    

    const updatedUser=await userModel.findByIdAndUpdate(
        user._id,
        {
                $set: {
                    profilePicture: null,
                    public_id: null
                }
            },
            {
                new: true,
                runValidators: true
            }
    )

      if (!updatedUser) {
            return res.status(404).json({
                message: "User not found"
            });
        }

    res.status(200).json({
            message:"profile picture deleted Succesfully",
            user:updatedUser
    })



}
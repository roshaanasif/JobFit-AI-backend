const cloudinary=require("cloudinary").v2;
const config =require('../config/config')

cloudinary.config({
    cloud_name:config.CLOUDINARY_CLOUD_NAME,
    api_key:config.CLOUDINARY_API_KEY,
    api_secret:config.CLOUDINARY_API_SECRET
})


const uploadFile=async(buffer)=>{
      const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "jobFit-AI",
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      stream.end(buffer);
      console.log("result:",stream)
    });

    console.log("result:",result)
    return result
}

const deleteFile=async(public_id)=>{
    const result = await cloudinary.uploader.destroy(public_id)
    console.log("result:",result)
    return result
}


module.exports={uploadFile,deleteFile}
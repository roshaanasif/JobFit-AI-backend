const express=require('express')

const router=express.Router()
const profileControllers=require("../controllers/profile.Controllers")
const middleware=require("../middleware/auth.middleware")
const multer=require('multer');
const upload=multer({storage:multer.memoryStorage()})



router.put("/",middleware.authmiddleware,upload.single("profilePicture"),profileControllers.updateProfileController)
router.post("/picture",middleware.authmiddleware,upload.single("profilePicture"),profileControllers.profilePictureController)
router.delete("/picture",middleware.authmiddleware,profileControllers.deleteProfilePictureController)


module.exports=router
const express =require('express')

const router=express.Router()
const authControllers=require("../controllers/auth.Controllers")
const middleware=require("../middleware/auth.middleware")


router.post("/register",authControllers.userRegisterController)

router.post("/login",authControllers.userLoginController)

router.post("/logout",middleware.authmiddleware,authControllers.userLogoutController)

router.get("/get-me",middleware.authmiddleware,authControllers.getMeController)

// router.get("/forget-password",authControllers.forgetPasswordController)

router.get("/refresh-token",middleware.authmiddleware,authControllers.refreshTokenController)
 

module.exports=router


const express=require('express')

const router=express.Router()
const reportControllers=require("../controllers/report.Controllers")
const middleware=require("../middleware/auth.middleware")



router.get('/KPI',middleware.authmiddleware,reportControllers.userKpiController)



module.exports=router
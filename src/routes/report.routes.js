const express=require('express')

const router=express.Router()
const reportControllers=require("../controllers/report.Controllers")
const middleware=require("../middleware/auth.middleware")
const upload=require("../middleware/file.middleware")


router.post('/',middleware.authmiddleware, upload.fields([{ name: 'resume', maxCount: 1 },{ name: 'jobDescription', maxCount: 1 }]),reportControllers.generateReport)
router.get('/report-history/:id',middleware.authmiddleware,reportControllers.reportHistoryController)


module.exports=router

const pdfParse =require('pdf-parse')
const extractImageText=require("../utils/extractTextFromImage")
const generateResumeReport=require("../services/gemini.service")
const reportModel=require('../models/report.model')

exports.generateReport=async(req,res)=>{

    const resume = req.files?.resume?.[0];
    const jobDescription = req.files?.jobDescription?.[0];
    const {description} = req.body;
    
    if(!resume){
        res.status(200).json({
            message:"Resume is required for generating report"
        })
    }
    
//   const resumeContent=pdfParse(resume.buffer)
  const resumeContent=await (new pdfParse.PDFParse(Uint8Array.from(resume.buffer))).getText()

  let jobDescriptionContent = "";

    if (jobDescription) {
    jobDescriptionContent = await extractImageText(jobDescription.buffer);
    } else if (req.body.jobDescription) {
    jobDescriptionContent = req.body.jobDescription;
    } else {
    return res.status(400).json({
        message: "Job description is required for generating report"
    });
    }

    const resumeReportWithAi=await generateResumeReport({
         resume:resumeContent.text,
        jobDescription:jobDescriptionContent,
        description
    })

    const report = await reportModel({
        user:req.user.userId,
        resume:resumeContent.text,
        jobDescription:jobDescriptionContent,
        description,
        ...resumeReportWithAi
    })


    res.status(201).json({
        message: "Report Genearated Sucessfully",
        report
    });





    
}
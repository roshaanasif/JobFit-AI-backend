
const pdfParse =require('pdf-parse')
const extractImageText=require("../utils/extractTextFromImage")
const generateResumeReport=require("../services/gemini.service")
const reportModel=require('../models/report.model')
const userModel=require('../models/user.model')

exports.generateReport=async(req,res)=>{

    const resume = req.files?.resume?.[0];
    const jobDescription = req.files?.jobDescription?.[0];
    const {description} = req.body;
    
    if(!resume){
        return res.status(200).json({
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
        jobdescription:jobDescriptionContent,
        description
    })

    const report = await reportModel.create({
        user:req.user._id,
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

exports.reportHistoryController=async(req,res)=>{
    const user=req.user
    const {id}=req.params;
    const {recent}=req.query;

    const matchingId=user._id.toString() === id


    if (!matchingId){
        return res.status(400).json({
            message:"invalid User Id , you should check only your history of reports"
        })
    }

    const isValidUser = await userModel.findById(id)

    if(!isValidUser){
        return res.status(400).json({
            message:"invalid User Id"
        })
    }
    const isRecent = recent === "true";
    const gettingReports=await reportModel.find({ user: id }).sort({ createdAt: -1 }).limit(isRecent ? 3 : 0);


   res.status(200).json({
            message:"reports fetched Successfully",
            reports:gettingReports
    })

}

exports.userKpiController=async(req,res)=>{
    
    const user=req.user
  
   const dashboardStats = await reportModel.aggregate([
    {
      $match: {
        user: user._id
      }
    },

    {
      $group: {
        _id: null,

        totalAnalyses: {
          $sum: 1
        },

        averageMatch: {
          $avg: "$matchScore"
        },

        strongMatches: {
          $sum: {
            $cond: [
              { $gt: ["$matchScore", 80] },
              1,
              0
            ]
          }
        },

        skillGaps: {
          $sum: {
            $size: {
              $ifNull: ["$skillGap", []]
            }
          }
        }
      }
    },

    {
      $project: {
        _id: 0,

        totalAnalyses: 1,

        averageMatch: {
          $round: [
            {
              $ifNull: ["$averageMatch", 0]
            },
            0
          ]
        },

        strongMatches: 1,

        skillGaps: 1
      }
    }
  ]);


  const stats=dashboardStats[0]||
{
    totalAnalyses: 0,
    averageMatch: 0,
    strongMatches: 0,
    skillGaps: 0
}

res.status(200).json({
    message:"User KPI fetched Successfullly",
    stats
})

}


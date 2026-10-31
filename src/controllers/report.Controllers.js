
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
        return res.status(400).json({
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
    const gettingReports=await reportModel.find({ user: id }).sort({ createdAt: -1 }).limit(isRecent ? 3 : 0).select("-resume -jobDescription -technicalQuestions -preparationPlan");


   res.status(200).json({
            message:"reports fetched Successfully",
            reports:gettingReports
    })

}

exports.userKpiController=async(req,res)=>{
    
    const user=req.user
  
 
  const stats=await user.getUserDashboardKpi()


  res.status(200).json({
      message:"User KPI fetched Successfullly",
      stats
  })

}

exports.singleReportController=async(req,res)=>{
    const {id}=req.params

    const user=req.user

    const report=await reportModel.findById(id)

    if(!report){
        return res.status(404).json({
            message:"Report not found"
        })
    }

    if(report.user.toString() !== user._id.toString()){
        return res.status(403).json({
            message:"You are not authorized to access this report"
        })
    }

    res.status(200).json({
        message:"Report fetched successfully",
        report
    })

}

exports.reportHistorySearchController=async(req,res)=>{
    const user=req.user;

    const search = req.body.search.trim();
    const { filter = "all", page = 1, limit = 10 } = req.query;
    const allowedFilters = ["all", "strong", "good", "low"];

    if (!allowedFilters.includes(filter)) {
        return res.status(400).json({
            message: "Invalid filter value",
        });
    }

    const requestedPage = Number(page);
    const requestedLimit = Number(limit);
    const currentPage = requestedPage > 0 ? requestedPage : 1; 
    const pageLimit = requestedLimit > 0
        ? Math.min(50, requestedLimit)
        : 10;
    const skip = (currentPage - 1) * pageLimit;
    const query = { user: user._id };

    if (search) {
        const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        query.$or = [
            { jobRole: { $regex: escapedSearch, $options: "i" } },
            { company: { $regex: escapedSearch, $options: "i" } },
            { "skillGap.skill": { $regex: escapedSearch, $options: "i" } },
        ];
    }

    if (filter === "strong") {
        query.matchScore = { $gte: 85 };
    } else if (filter === "good") {
        query.matchScore = { $gte: 75, $lt: 85 };
    } else if (filter === "low") {
        query.matchScore = { $lt: 75 };
    }

    const [totalReports, reports] = await Promise.all([
        reportModel.countDocuments(query),
        reportModel
            .find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(pageLimit)
            .select("-resume -jobDescription -technicalQuestions -preparationPlan")
            .lean(),
    ]);

    const totalPages = Math.ceil(totalReports / pageLimit);

    return res.status(200).json({
        message: "Reports fetched successfully",
        reports,
        pagination: {
            totalPages,
            totalReports,
            currentPage,
            pageLimit,
            hasNextPage: currentPage < totalPages,
            hasPrevPage: currentPage > 1 && currentPage <= totalPages,
        },
    });
};


const pdfParse =require('pdf-parse')
const axios=require('axios')
const extractImageText=require("../utils/extractTextFromImage")
const {generateResumeReport,generateResumeHtml}=require("../services/gemini.service")
const reportModel=require('../models/report.model')
const userModel=require('../models/user.model')
const resumeModel=require("../models/genratedResume.model")
const {uploadFile}=require("../services/cloudinary.service")

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

    if(!resumeReportWithAi){
        return res.status(500).json({
            message:"Report generation failed from AI service"
        })
    }


   const UploadResumeToCloudinary=await uploadFile(resume.buffer)

   if(!UploadResumeToCloudinary || !UploadResumeToCloudinary.secure_url){
     return res.status(500).json({
        message:"Resume upload to cloudinary failed"
     })
   }

    const report = await reportModel.create({
        user:req.user._id,
        resume:UploadResumeToCloudinary.secure_url,
        jobDescription:jobDescriptionContent,
        publicId: UploadResumeToCloudinary.public_id,
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
    const {recent , page=1 ,limit=10 }=req.query;
 


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

    const requestedPage=Number(page)
    const requestedLimit=Number(limit)
    const currentPage = requestedPage > 0 ? requestedPage : 1;
    const pageLimit = requestedLimit > 0 ? Math.min(20,requestedLimit) : 10 ;
    const skip = (currentPage - 1) * pageLimit;


    const gettingReports=await reportModel
    .find({user:id})
    .sort({ createdAt: -1 })
    .limit(isRecent ? 3 : pageLimit)
    .skip(isRecent ? 0 : skip )
    .select("-resume -jobDescription -technicalQuestions -preparationPlan");

    const totalReports=gettingReports.length;
    const totalPages=Math.ceil(totalReports/requestedLimit)

   res.status(200).json({
            message:"reports fetched Successfully",
            reports:gettingReports,
            ...(!isRecent && {
            pagination: {
                totalPages,
                totalReports,
                pageLimit,
                currentPage,
                hasNextPage:requestedPage<totalPages,
                hasPrevPage:currentPage>0 && currentPage <= totalPages 
            }
        })

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

exports.generateResumePdfController=async(req,res)=>{

    const {reportId}=req.params ;
    
    const Report=await reportModel.findById(reportId)

    if(!Report){

    return res.status(400).json({
        message:"invalid ReportID"
    })

    }

    const alreadyGeneratedResume=await resumeModel.findOne({ report: reportId })

    if(alreadyGeneratedResume && alreadyGeneratedResume?.status !== "failed"){

        return res.status(200).json({
            message:"Resume already generated for this report",
            generatedResume:alreadyGeneratedResume
        })

    }


   const {jobDescription,description,resume}=Report

    const response = await axios.get(resume, {
        responseType: "arraybuffer"
    });

// Convert to Buffer
const pdfBuffer = Buffer.from(response.data);

// const resumeContent=await (new pdfParse.PDFParse(Uint8Array.from(pdfBuffer))).getText()

const resumeContent =await (new pdfParse.PDFParse({
    data: new Uint8Array(pdfBuffer)
})).getText();

    const pdf =await generateResumeHtml({ 
        resume:resumeContent.text,
        jobdescription:jobDescription,
        description
    })

 
    if(!pdf || pdf.length === 0){
        await resumeModel.create({
        report:reportId,
        originalResume:resume,
        status:"failed",
    })

    return res.status(500).json({
        message:"resume generation failed",
        originalResume:resume
    })

    }

    const uploadingToCloudinary=await uploadFile(pdf)

    if(!uploadingToCloudinary || !uploadingToCloudinary.secure_url){
        await resumeModel.create({
        report:reportId,
        originalResume:resume,
        status:"failed"
        })

        return res.status(500).json({
            message:"resume generation failed"
        })
    }
  
    const generatedResume = await resumeModel.create({
        report:reportId,
        resume:uploadingToCloudinary.secure_url,
        originalResume:resume,
        publicId: uploadingToCloudinary.public_id,
    })

    res.status(201).json({
        message:"Resume Generated Successfully",
        generatedResume
    })

}

// exports.generateResumePdfController = async (req, res) => {

//     let generatedResume;
//     let parser;

//     try {

//         const { reportId } = req.params;

//         const Report = await reportModel.findById(reportId);

//         if (!Report) {
//             return res.status(404).json({
//                 message: "Invalid Report ID"
//             });
//         }

//         generatedResume = await resumeModel.findOne({
//             report: reportId
//         });

//         if (generatedResume && generatedResume.status !== "failed") {
//             return res.status(200).json({
//                 message: "Resume already generated for this report",
//                 generatedResume
//             });
//         }

//         const { jobDescription, description, resume } = Report;

//         if (generatedResume) {


//         const response = await axios.get(resume, {
//             responseType: "arraybuffer",
//             timeout: 30000
//         });

//         const pdfBuffer = Buffer.from(response.data);

//         parser = new PDFParse({
//             data: new Uint8Array(pdfBuffer)
//         });

//         const result = await parser.getText();

//         const resumeContent = result.text;

//         if (!resumeContent || !resumeContent.trim()) {
//             throw new Error("Unable to extract text from original PDF");
//         }

//         const pdf = await generateResumeHtml({
//             resume: resumeContent,
//             jobdescription: jobDescription,
//             description
//         });

//         if (!pdf || pdf.length === 0) {
//             throw new Error("Resume PDF generation failed");
//         }

//         const uploadingToCloudinary = await uploadFile(pdf);

//         if (!uploadingToCloudinary?.secure_url) {
//             throw new Error("Cloudinary upload failed");
//         }

//         generatedResume.resume = uploadingToCloudinary.secure_url;
//         generatedResume.status = "completed";

//         await generatedResume.save();

//         return res.status(201).json({
//             message: "Resume Generated Successfully",
//             generatedResume
//         });

//     }
// } catch (error) {

//         console.error("Resume generation error:", error);

//         if (generatedResume) {
//             generatedResume.status = "failed";
//             await generatedResume.save().catch(console.error);
//         }

//         return res.status(500).json({
//             message: "Resume generation failed",
//             error: error.message
//         });

//     } finally {

//         if (parser) {
//             await parser.destroy().catch(console.error);
//         }

//     }

// };


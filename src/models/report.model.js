const mongoose=require('mongoose')

const skillGapSchema=new mongoose.Schema({
    skill:{
        type:String,
        required:[true,"Skill is Required"]
    },
    severity:{
            type:String,
            enum:["Low","Medium","High"],
            required:[true,"severity is Required"]
        }
    
},{
    _id:false
})
const technicalQuestionSchema=new mongoose.Schema({
    Question:{
        type:String,
        required:[true,"Question is Required"]
    },
    Answer:{
        type:String,
        required:[true,"Answer is Required"]
    },
    Intention:{
        type:String,
        required:[true,"Intention is Required"]
    }
},{
    _id:false
})

const preparationPlanSchema=new mongoose.Schema({

        day:{
            type:Number,
            required:[true,"day is Required"]
        },
        tasks:[{
            required:[true,"Tasks are Required"],
            type:String,
            }
            ],
        focus:{
            type:String,
            required:[true,"Topic is required Required"]
        }
},{
    _id:false
})
const reportSchema=new mongoose.Schema({

    jobDescription:{
        type:String,
        required:[true,"Job description Is Required"]
    },
    description:{
        type:String,
    },
    resume:{
        type:String,
        required:[true,"Resume Is Required For Matching"]
    },
    matchScore:{
        type:Number,
        min:0,
        max:100
    },
    skillGap:[skillGapSchema],
    preparationPlan:[preparationPlanSchema],
    technicalQuestions:[technicalQuestionSchema],
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    }
})




const reportModel=mongoose.model("report",reportSchema)


module.exports=reportModel
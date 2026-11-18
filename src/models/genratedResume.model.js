const mongoose=require('mongoose')

const generatedResumeSchema=new mongoose.Schema({
    resume:{
        type:String,
        required: function () {
        return this.status === "generated";
      },
    },
    report:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"report",
        required:true
    },
     originalResume: {
      type: String,
    },
    publicId:{
      type: String,
      required:true
    },
    status: {
      type: String,
      enum: ["generated", "failed"],
      default: "generated",
    }
},{
   timestamps:true
})


const generatedResumeModel=mongoose.model("generatedResume",generatedResumeSchema)



module.exports=generatedResumeModel
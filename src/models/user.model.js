const mongoose=require('mongoose');
const bcrypt=require('bcryptjs')
const reportModel=require("../models/report.model")

const userSchema=new mongoose.Schema({
    email:{
        type :String,
        required:[true,"Email is required for creating user"],
        trim:true,
        lowercase:true,
        match:[/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,"Invalid email Address"],
        unique:[true,"Email Already Exists"]
    },
    name:{
        type :String,
        required:[true,"Name is required for creating an account"],
    },
    password:{
        type:String,
        required:[true,"Password is required for creating an account"],
        minlength:[6,"password should contain more than six Characters"],
        select:false
    },
       profilePicture:{
        type :String,
        default:null,
    },
      public_id:{
        type :String,
        default:null,
    }
},{
    timestamps:true
})



userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
});


userSchema.methods.comparePasswords=async function(password){

  return await bcrypt.compare(password,this.password)
    
}

userSchema.methods.getUserDashboardKpi=async function(){

      const dashboardStats = await reportModel.aggregate([
    {
      $match: {
        user: this._id
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

  return dashboardStats[0]||{
    totalAnalyses: 0,
    averageMatch: 0,
    strongMatches: 0,
    skillGaps: 0
}

}

const userModel=mongoose.model("user",userSchema)


module.exports=userModel
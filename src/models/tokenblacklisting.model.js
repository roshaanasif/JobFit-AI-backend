const mongoose=require('mongoose');


const tokenSchema=new mongoose.Schema({

    token:{
        type :String,
        required:[true,"token is required for blacklisting"],
        immutable:true,
        unique:true
    }
   
},{
    timestamps:true
})


const tokenModel=mongoose.model("token-blacklisting",tokenSchema)


module.exports=tokenModel
const mongoose=require('mongoose');
const bcrypt=require('bcryptjs')

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


const userModel=mongoose.model("user",userSchema)


module.exports=userModel
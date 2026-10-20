const mongoose=require('mongoose')
const config =require('./config')


const connectToDB=async()=>{

  
    await mongoose.connect(config.MONGODB_URI)
    .then(()=>{
        console.log("database connected sucessfully");
    }).catch(err => {
        console.log("error in connectiong to DB:",err);
        process.exit(1)
    })

   
}


module.exports=connectToDB
const app=require('./src/app');
const connectToDB=require('./src/config/db')
const {resume,jobdescription,description}=require('./src/utils/temp')
const checkingAI=require("./src/services/gemini.service")
connectToDB()

checkingAI({resume,jobdescription,description})

app.listen(5000,()=>{
console.log("server is listening on 5000");

})
require('dotenv').config()


const config={
    MONGODB_URI:process.env.MONGODB_URI,
    JWT_SECRET:process.env.JWT_SECRET,
    JWT_REFRESH_SECRET:process.env.JWT_REFRESH_SECRET,
    GOOGLE_GENAI_API_KEY:process.env.GEMINI_API_KEY
}

module.exports=config
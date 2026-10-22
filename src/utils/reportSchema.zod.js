const z =require("zod")


const reportJsonSchema = {
    type: "object",
  properties: {
    message: {
      type: "string"
    }
  },
  required: ["message"]
  }



module.exports=reportJsonSchema
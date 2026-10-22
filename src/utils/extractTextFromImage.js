


const { createWorker } = require('tesseract.js');

const extractImageText=async(imagePath)=>{
  const worker = await createWorker('eng');

  const { data } = await worker.recognize(imagePath);

  await worker.terminate();

  return data.text;
}

module.exports=extractImageText
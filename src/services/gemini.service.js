const {GoogleGenAI}=require("@google/genai")
const config=require('../config/config')
const reportJsonSchema=require('../utils/reportSchema.zod')

const ai =new GoogleGenAI({
    apiKey:config.GOOGLE_GENAI_API_KEY
})


const checkingAi=async({resume,jobdescription,description})=>{


const prompt=`

You are an expert technical recruiter, career advisor, and interview preparation specialist.

Your task is to analyze a candidate's resume against a target job description and generate a structured assessment.

You will receive two inputs:

1. RESUME
   - The candidate's resume containing their skills, experience, projects, education, technologies, and professional background.

2. JOB DESCRIPTION
   - The target job description containing the required skills, responsibilities, qualifications, technologies, experience, and other expectations for the role.

Your analysis must be based ONLY on the information provided in the resume and job description. Do not assume that the candidate has a skill, technology, experience, certification, or qualification that is not supported by the resume.

## Analysis Requirements

### 1. Match Score

Calculate a match score from 0 to 100.

The score should represent how well the candidate matches the target job based on factors such as:

- Required technical skills
- Preferred technical skills
- Relevant work experience
- Years of experience
- Project experience
- Responsibilities performed
- Education and certifications when relevant
- Domain knowledge
- Tools and technologies
- Overall alignment with the role

Use the following general interpretation:

- 90–100: Excellent match; candidate satisfies almost all important requirements.
- 75–89: Strong match; candidate satisfies most requirements but has some gaps.
- 60–74: Moderate match; candidate has relevant background but several important gaps exist.
- 40–59: Weak match; candidate has some relevant skills but is missing multiple important requirements.
- 0–39: Poor match; candidate's background has limited alignment with the role.

Do not give a high score simply because the candidate has many technologies. Prioritize skills and experience that are specifically relevant to the job description.

### 2. Skill Gaps

Identify the most important skills that the candidate is missing, has insufficient evidence for, or should improve based on the job description.

For every skill gap:

- Provide a specific skill name.
- Assign a severity:
  - "High" — critical requirement or major gap that could significantly affect the candidate's ability to perform the role.
  - "Medium" — important skill that would strengthen the candidate's profile but is not necessarily critical.
  - "Low" — useful additional skill that would provide a minor advantage.

Do not list skills that are already clearly demonstrated in the resume as skill gaps.

Prioritize the most relevant gaps instead of generating an unnecessarily long list.

### 3. Technical Interview Questions

Generate technical interview questions based on:

- The requirements of the job description.
- The candidate's existing skills.
- The identified skill gaps.
- Technologies mentioned in the job description.
- Practical responsibilities of the target role.

Questions should preferably be practical, scenario-based, and relevant to real-world engineering work rather than simple definition-based questions.

For every question provide:

- Question: The interview question.
- Answer: A technically accurate and well-explained answer that demonstrates what a strong candidate should know.
- Intention: Explain what the interviewer is trying to evaluate.

Questions should help the candidate prepare for an actual interview for this specific role.

### 4. Preparation Plan

Create a practical day-by-day preparation plan based on the candidate's skill gaps.

The plan should:

- Start with the most important missing fundamentals.
- Progress from fundamentals to practical implementation.
- Focus on skills required by the target job.
- Include hands-on tasks whenever possible.
- Avoid spending excessive time on skills the candidate already demonstrates strongly.
- Prioritize High-severity skill gaps before Medium and Low gaps.
- Make every task actionable and specific.

For each day provide:

- day: Sequential day number.
- focus: The main topic or skill for that day.
- tasks: Specific tasks the candidate should complete.

The preparation plan should be realistic and directly connected to the candidate's identified weaknesses.

## Important Rules

1. Do not invent information about the candidate.
2. Do not assume experience that is not present in the resume.
3. Do not mark a skill as missing if the resume clearly demonstrates that skill.
4. Compare the resume against the actual requirements of the job description.
5. Prioritize required skills over nice-to-have skills.
6. Be specific rather than giving generic career advice.
7. Technical interview questions should be relevant to the target role.
8. The preparation plan should directly address the identified skill gaps.
9. Keep the output concise enough to be useful, but provide enough detail to make the analysis actionable.
10. Return ONLY valid JSON matching the provided JSON schema.
11. Do not include Markdown, explanations, headings, or text outside the JSON response.

## Input

RESUME:

${resume}

JOB DESCRIPTION:

${jobdescription}

description:

${description}

Analyze the resume against the job description and return the result according to the provided JSON schema.`

    const response = await ai.interactions.create({
   model: "gemini-3.5-flash-lite",
    input: prompt,
    response_format: {
        type: 'text',
        mime_type: 'application/json',
        schema: reportJsonSchema
    },
    });
    

    const result = JSON.parse(response.output_text);

    console.log("PARSED RESULT:", result);
    // console.log(response.output_text)

    return result

}


module.exports=checkingAi
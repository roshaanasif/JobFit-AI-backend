const {GoogleGenAI}=require("@google/genai")
const config=require('../config/config')
const puppeteer=require("puppeteer")
const {reportJsonSchema,resumeHtmlSchema}=require('../utils/reportSchema.zod')

const ai =new GoogleGenAI({
    apiKey:config.GOOGLE_GENAI_API_KEY
})


// const generateResumePdf=async({resumeContent})=>{

//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();

//     await page.setContent(resumeContent)

//     const pdf = await page.pdf({
//       format: "A4",
//       printBackground: true,
//     });

//     res.send(pdf);

//     await browser.close();
// }

const generateResumePdf = async ({ resumeContent }) => {
  if (!resumeContent || typeof resumeContent !== "string") {
    throw new Error("Invalid resume HTML content");
  }

  const browser = await puppeteer.launch({
    headless: true,
  });

  try {
    const page = await browser.newPage();

    await page.setContent(resumeContent, {
      waitUntil: "networkidle0",
    });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
    });

    if (!pdf || pdf.length === 0) {
      throw new Error("PDF generation failed");
    }

    const pdfBuffer = Buffer.from(pdf);

    if (pdfBuffer.subarray(0, 5).toString() !== "%PDF-") {
      throw new Error("Invalid PDF generated");
    }

    return pdfBuffer;

  } finally {
    await browser.close();
  }
};


const generateResumeHtml=async({resume,jobdescription,description})=>{


    const prompt=`
    # Role: Professional ATS Resume Optimization and Career Specialist

You are an expert Resume Writer, ATS Optimization Specialist, Technical Recruiter, and Career Consultant.

Your task is to transform the user's existing resume into a highly professional, ATS-friendly, one-page resume tailored specifically to the provided Job Description (JD) and additional user instructions.

Your objective is to maximize the relevance of the candidate's actual qualifications, skills, experience, and achievements to the target position WITHOUT inventing, exaggerating, or falsifying any information.

---

## INPUT DATA

You will receive the following information:

1. **Original Resume:**${resume}.
2. **Job Description:** ${jobdescription}.
3. **Additional Description:** ${description}.

Use all three inputs to produce the optimized resume.

---

## STEP 1: ANALYZE THE ORIGINAL RESUME

Carefully examine the original resume and identify:

- Candidate's full name.
- Email address.
- Phone number.
- Location.
- LinkedIn profile.
- GitHub profile.
- Portfolio or personal website.
- Professional summary.
- Educational background.
- Employment history.
- Internship experience.
- Technical skills.
- Soft skills.
- Projects.
- Certifications.
- Achievements.
- Relevant accomplishments.

Extract all relevant information accurately.

Important rules:

- Preserve the candidate's actual identity and contact information.
- Preserve accurate employment dates and educational qualifications.
- Do not remove important achievements without a valid reason.
- Identify outdated, irrelevant, repetitive, or weak content.
- Identify spelling, grammar, formatting, and wording problems.
- Never invent missing information.

---

## STEP 2: ANALYZE THE JOB DESCRIPTION

Understand the target role and identify:

1. Job title.
2. Required qualifications.
3. Required technical skills.
4. Preferred technical skills.
5. Required experience.
6. Relevant tools and technologies.
7. Responsibilities.
8. Industry-specific terminology.
9. Important ATS keywords.
10. Expected professional competencies.

Classify keywords into:

- Critical Keywords: Essential skills and qualifications.
- Important Keywords: Frequently mentioned responsibilities and technologies.
- Preferred Keywords: Additional or desirable qualifications.
- Soft Skills: Communication, leadership, teamwork, problem-solving, etc.

Identify which requirements are already supported by the candidate's resume.

---

## STEP 3: MATCH RESUME WITH JOB REQUIREMENTS

Compare the original resume against the job description.

For every important job requirement:

- Identify matching skills.
- Identify relevant projects.
- Identify relevant professional experience.
- Identify transferable skills.
- Identify missing requirements.
- Identify opportunities to improve wording.

Prioritize the candidate's most relevant experience and achievements.

Do not add a skill simply because it appears in the job description.

Only include skills that are supported by the original resume or explicitly confirmed by the user's additional description.

---

## STEP 4: REWRITE THE PROFESSIONAL SUMMARY

Create a concise, powerful, job-specific professional summary.

Requirements:

- Approximately 40–60 words.
- Include the candidate's relevant professional identity.
- Highlight the most relevant technical skills.
- Emphasize relevant experience and strengths.
- Naturally incorporate important ATS keywords.
- Focus on the target position.
- Avoid generic statements.
- Avoid exaggerated claims.
- Do not claim years of experience unless supported by the source resume.

The summary must immediately communicate why the candidate is relevant to the target position.

---

## STEP 5: OPTIMIZE WORK EXPERIENCE

Rewrite employment and internship descriptions.

For each relevant position:

- Preserve the original job title.
- Preserve company name.
- Preserve employment dates.
- Prioritize responsibilities relevant to the target job.
- Use strong action verbs.
- Highlight measurable achievements when actual figures are available.
- Naturally incorporate relevant keywords.
- Remove repetitive and unnecessary descriptions.
- Use concise bullet points.

Prefer action-oriented wording such as:

- Developed
- Implemented
- Designed
- Optimized
- Integrated
- Automated
- Managed
- Improved
- Delivered
- Collaborated

IMPORTANT:

Never fabricate percentages, revenue, user counts, project outcomes, performance improvements, or other measurable achievements.

If numerical achievements are not available, describe the actual contribution clearly without inventing metrics.

---

## STEP 6: OPTIMIZE TECHNICAL SKILLS

Organize the candidate's existing skills into relevant categories.

Examples:

- Programming Languages
- Frontend Technologies
- Backend Technologies
- Databases
- Frameworks and Libraries
- Developer Tools
- Cloud and Deployment
- Other Relevant Skills

Requirements:

- Prioritize skills mentioned in the job description.
- Keep the skill categories relevant to the target position.
- Remove unsupported technologies.
- Avoid unnecessary repetition.
- Do not add technologies based solely on job requirements.

---

## STEP 7: OPTIMIZE PROJECTS

Select the most relevant projects for the target job.

For each selected project:

- Preserve the actual project name.
- Provide a concise description.
- Highlight relevant technologies.
- Explain the candidate's actual contribution.
- Highlight relevant technical implementation.
- Include GitHub and live demo links when available.
- Prioritize projects demonstrating skills requested in the job description.

Use approximately 1–3 concise bullet points per project, depending on available space.

Do not invent project functionality, users, performance metrics, or technologies.

---

## STEP 8: OPTIMIZE EDUCATION AND CERTIFICATIONS

Preserve accurate:

- Degree names.
- Institution names.
- Graduation dates.
- Relevant certifications.
- Relevant academic achievements.

Use concise formatting to conserve space.

Never invent degrees, certifications, grades, or institutions.

---

## STEP 9: MAKE THE RESUME ATS-FRIENDLY

Follow these strict ATS formatting requirements:

1. Use a clean, professional, single-column layout.
2. Use standard section headings.
3. Avoid tables and multiple columns.
4. Avoid text boxes.
5. Avoid graphics and decorative elements.
6. Avoid skill-rating bars.
7. Avoid icons for contact information.
8. Avoid headers and footers containing essential information.
9. Use standard fonts such as Arial, Calibri, or Helvetica.
10. Use consistent date formatting.
11. Use standard bullet points.
12. Maintain readable font sizes.
13. Use clear section hierarchy.
14. Use relevant keywords naturally.
15. Avoid keyword stuffing.
16. Avoid hidden keywords.
17. Avoid unnecessary decorative formatting.
18. Ensure the PDF contains selectable text.

Recommended section order:

1. Candidate Name and Contact Information
2. Professional Summary
3. Technical Skills
4. Professional Experience
5. Projects
6. Education
7. Certifications (if relevant)

You may adjust the order according to the candidate's background and the target job.

---

## STEP 10: STRICT ONE-PAGE RESUME REQUIREMENT

The final resume MUST fit on exactly ONE A4 page.

Recommended formatting:

- Page Size: A4.
- Margins: 0.4–0.55 inches.
- Font: Arial, Calibri, or Helvetica.
- Candidate Name: 18–22 pt.
- Section Headings: 10–12 pt.
- Body Text: 9–10.5 pt.
- Line Spacing: 1.0–1.1.
- Compact but readable section spacing.

To achieve one page:

- Prioritize relevant information.
- Remove unnecessary descriptions.
- Combine related skills.
- Reduce repetitive bullet points.
- Use concise professional language.
- Remove outdated or irrelevant information.
- Retain the strongest projects and achievements.

IMPORTANT:

Never solve the one-page requirement by making text excessively small or unreadable.

Do not omit essential qualifications simply to meet the page limit.

If the source resume contains too much important information, intelligently prioritize the content based on job relevance.

---

## STEP 11: ADDITIONAL USER INSTRUCTIONS

Follow the user's additional description when provided.

Examples:

- Target a specific job title.
- Emphasize particular technologies.
- Highlight a particular project.
- Prefer a fresher-level resume.
- Focus on backend development.
- Remove irrelevant experience.
- Use a more professional writing style.

Additional instructions must not override factual accuracy.

If the additional description conflicts with verified resume information, preserve factual accuracy.

---

## STEP 12: FINAL QUALITY CHECK

Before producing the final resume, verify:

- Candidate identity is accurate.
- Contact details are preserved.
- No fake experience has been introduced.
- No fake qualifications have been introduced.
- No unsupported technical skills have been added.
- Job-specific keywords are incorporated naturally.
- Grammar and spelling are correct.
- Bullet points are concise.
- Professional summary is relevant.
- Resume follows ATS-friendly formatting.
- All important links are preserved.
- Resume fits on one A4 page.
- Text is selectable and readable in the final PDF.

---

## FINAL OUTPUT REQUIREMENTS

Generate the following deliverables:

### A. Optimized Resume
A complete, professionally rewritten, ATS-friendly, one-page resume tailored to the provided job description.

### B. Optimization Summary
Explain briefly:

- What major changes were made.
- Which sections were improved.
- Which keywords were incorporated.
- Which existing skills were prioritized.
- What irrelevant or repetitive information was reduced.

### C. Missing Skills Analysis
Identify job requirements that are not demonstrated in the original resume.

Separate them into:

- Missing Critical Skills.
- Missing Preferred Skills.
- Skills Requiring User Confirmation.

Do not add these skills to the resume unless the candidate confirms them.

### D. ATS Optimization Checklist

Provide a checklist confirming:

- Standard section headings.
- Single-column structure.
- Relevant keywords.
- Professional summary.
- Readable formatting.
- No unsupported claims.
- One-page A4 layout.

### FINAL INSTRUCTION

Your highest priorities are:

1. Factual accuracy.
2. Relevance to the target job.
3. ATS compatibility.
4. Professional presentation.
5. One-page readability.

Produce a resume that accurately represents the candidate's real qualifications while presenting them in the strongest possible way for the target job.

Never fabricate information to improve ATS matching.`


   const response = await ai.interactions.create({
   model: "gemini-3.5-flash-lite",
    input: prompt,
    response_format: {
        type: 'text',
        mime_type: 'application/json',
        schema: resumeHtmlSchema
    },
    });

  const generatedResumeContent = JSON.parse(response.output_text);


  const resumePdf =await generateResumePdf({resumeContent:generatedResumeContent.resumeHtml})


  return resumePdf



}


const generateResumeReport=async({resume,jobdescription,description})=>{


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

    // console.log("PARSED RESULT:", result);
    // // console.log(response.output_text)

    return result

}


module.exports={generateResumeReport,generateResumeHtml}
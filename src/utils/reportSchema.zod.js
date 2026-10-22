const z =require("zod")


const reportJsonSchema = {
  type: "object",
  properties: {
    matchScore: {
      type: "number",
      description:
        "A compatibility score from 0 to 100 representing how well the candidate's skills, experience, and background match the requirements of the target job. Return 0 for a very poor match and 100 for an excellent match.",
      minimum: 0,
      maximum: 100
    },

    skillGap: {
      type: "array",
      description:
        "A list of important skills the candidate is missing, lacks proficiency in, or should improve to become a stronger match for the target job. Only include meaningful skill gaps based on the candidate's profile and job requirements.",
      items: {
        type: "object",
        properties: {
          skill: {
            type: "string",
            description:
              "The specific technical, professional, or domain skill that the candidate is missing or needs to improve. Use a clear and concise skill name such as 'Docker', 'PostgreSQL', 'System Design', or 'React Testing'."
          },
          severity: {
            type: "string",
            enum: ["Low", "Medium", "High"],
            description:
              "The importance of this skill gap for the target role. Use 'High' when the missing skill is critical to the job requirements, 'Medium' when it is important but not essential, and 'Low' when it would provide only a minor advantage."
          }
        },
        required: ["skill", "severity"],
        additionalProperties: false
      }
    },

    technicalQuestions: {
      type: "array",
      description:
        "A list of technical interview questions that are relevant to the candidate's skill gaps and the requirements of the target job. Questions should test practical understanding rather than only memorization.",
      items: {
        type: "object",
        properties: {
          Question: {
            type: "string",
            description:
              "A clear and specific technical interview question relevant to the target role. Prefer practical, scenario-based questions that evaluate how the candidate would apply their knowledge in a real-world situation."
          },
          Answer: {
            type: "string",
            description:
              "A technically accurate and well-structured answer to the question. Explain the concept clearly and, where appropriate, include practical examples, implementation details, trade-offs, or best practices."
          },
          Intention: {
            type: "string",
            description:
              "Explain what the interviewer is trying to evaluate with this question, such as the candidate's conceptual understanding, problem-solving ability, practical experience, knowledge of best practices, or ability to handle real-world scenarios."
          }
        },
        required: ["Question", "Answer", "Intention"],
        additionalProperties: false
      }
    },

    preparationPlan: {
      type: "array",
      description:
        "A structured day-by-day preparation plan designed to help the candidate close their skill gaps and prepare for the target role. Organize the plan in a logical learning sequence, starting with foundational topics and progressing toward practical and advanced topics.",
      items: {
        type: "object",
        properties: {
          day: {
            type: "integer",
            description:
              "The sequential day number in the preparation plan. Start from 1 and increment by one for each day."
          },
          tasks: {
            type: "array",
            description:
              "A list of specific, actionable tasks the candidate should complete on this day. Tasks should be concrete and practical, such as learning a concept, implementing a feature, solving exercises, or building a small project.",
            items: {
              type: "string",
              description:
                "A specific actionable preparation task that can be completed during the given day."
            }
          },
          focus: {
            type: "string",
            description:
              "The main topic, skill, or concept the candidate should focus on during this day. Keep it specific and directly related to the identified skill gaps or target job requirements."
          }
        },
        required: ["day", "tasks", "focus"],
        additionalProperties: false
      }
    }
  },

  required: [
    "matchScore",
    "skillGap",
    "technicalQuestions",
    "preparationPlan"
  ],

  additionalProperties: false
};



module.exports=reportJsonSchema
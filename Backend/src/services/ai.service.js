const Groq = require("groq-sdk")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")
const puppeteer = require("puppeteer")

const ai = new Groq({
    apiKey: process.env.GROQ_API_KEY,
})

const interviewReportSchema = z.object({
    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job describe"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum([ "low", "medium", "high" ]).describe("The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances")
    })).describe("List of skill gaps in the candidate's profile along with their severity"),
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc."),
        tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.")
    })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),
    title: z.string().describe("The title of the job for which the interview report is generated"),
})

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
    const prompt = `Generate an interview report for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}
                        
                        CRITICAL INSTRUCTION FOR RANDOMIZATION:
                        To ensure a highly varied preparation experience, you MUST select a unique, randomized, and highly diverse set of technical and behavioral questions.
                        Avoid picking only the standard default, high-level questions for the specified tech stack (e.g. do not just ask general React performance or MERN state management questions every time).
                        Instead, introduce high diversity and randomly focus on a wide variety of specific, deep sub-topics within the tech stack (e.g. database querying/indexing strategies, custom hooks, memory management, REST vs gRPC, authentication micro-patterns, security headers, caching layers, build optimizations, etc.) and cover random levels of difficulty.
                        Each report generated must feel completely fresh, unique, and randomly distributed compared to others.
                        
                        You MUST return ONLY valid JSON matching the following schema:
                        ${JSON.stringify(zodToJsonSchema(interviewReportSchema))}
`

    const response = await ai.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 1.0, // Set high temperature to maximize output randomness and question variation
    })

    return JSON.parse(response.choices[0].message.content)
}

async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
        format: "A4", margin: {
            top: "20mm",
            bottom: "20mm",
            left: "15mm",
            right: "15mm"
        }
    });

    await browser.close();

    return pdfBuffer;
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {

    const resumePdfSchema = z.object({
        html: z.string().describe("The HTML content of the resume which can be converted to PDF using any library like puppeteer")
    })

    const prompt = `Generate resume for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        the response MUST BE a valid JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
                        The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
                        The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
                        you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
                        The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
                        The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.
                        
                        Return ONLY valid JSON matching this schema:
                        ${JSON.stringify(zodToJsonSchema(resumePdfSchema))}
                    `

    const response = await ai.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
    })


    const jsonContent = JSON.parse(response.choices[0].message.content)

    const pdfBuffer = await generatePdfFromHtml(jsonContent.html)

    return pdfBuffer

}

const answerEvaluationSchema = z.object({
    score: z.number().min(0).max(100).describe("A score between 0 and 100 based on how complete and correct the user's answer is compared to the model answer."),
    feedback: z.string().describe("Constructive feedback for the user explaining why they got this score, and pointing out areas of improvement."),
    strengths: z.array(z.string()).describe("Key strengths of the user's answer."),
    weaknesses: z.array(z.string()).describe("Key weaknesses or missing details in the user's answer.")
})

async function evaluateAnswer({ question, modelAnswer, userAnswer }) {
    const prompt = `Evaluate the candidate's spoken answer to the following interview question.
                    
                    Question: ${question}
                    Model Answer / Expected Points: ${modelAnswer}
                    Candidate's Answer: ${userAnswer}

                    Analyze the candidate's answer. Compare it with the model answer. Be constructive yet critical. If the candidate's answer is empty, gibberish, or irrelevant, return a low score and request a clear answer.
                    
                    You MUST return ONLY valid JSON matching this schema:
                    ${JSON.stringify(zodToJsonSchema(answerEvaluationSchema))}
`

    const response = await ai.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
    })

    return JSON.parse(response.choices[0].message.content)
}

module.exports = { generateInterviewReport, generateResumePdf, evaluateAnswer }
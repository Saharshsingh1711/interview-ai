const pdfParse = require("pdf-parse")
const { generateInterviewReport, generateResumePdf, evaluateAnswer } = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")
const mockInterviewModel = require("../models/mockInterview.model")




/**
 * @description Controller to generate interview report based on user self description, resume and job description.
 */
async function generateInterViewReportController(req, res) {
    try {
        if (!req.file || !req.file.buffer) {
            return res.status(400).json({ message: "Resume PDF is required." });
        }

        const resumeContent = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText()
        const { selfDescription, jobDescription } = req.body

        if (!jobDescription) {
            return res.status(400).json({ message: "Job Description is required." });
        }

        const interViewReportByAi = await generateInterviewReport({
            resume: resumeContent.text,
            selfDescription,
            jobDescription
        })

        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeContent.text,
            selfDescription,
            jobDescription,
            ...interViewReportByAi
        })

        res.status(201).json({
            message: "Interview report generated successfully.",
            interviewReport
        })
    } catch (error) {
        console.error("Error generating interview report:", error);
        res.status(500).json({ 
            message: error.message || "An unexpected error occurred while generating the interview report." 
        });
    }
}

/**
 * @description Controller to get interview report by interviewId.
 */
async function getInterviewReportByIdController(req, res) {

    const { interviewId } = req.params

    const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id })

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    res.status(200).json({
        message: "Interview report fetched successfully.",
        interviewReport
    })
}


/** 
 * @description Controller to get all interview reports of logged in user.
 */
async function getAllInterviewReportsController(req, res) {
    const interviewReports = await interviewReportModel.find({ user: req.user.id }).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

    res.status(200).json({
        message: "Interview reports fetched successfully.",
        interviewReports
    })
}


/**
 * @description Controller to generate resume PDF based on user self description, resume and job description.
 */
async function generateResumePdfController(req, res) {
    const { interviewReportId } = req.params

    const interviewReport = await interviewReportModel.findById(interviewReportId)

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    const { resume, jobDescription, selfDescription } = interviewReport

    const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription })

    res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
    })

    res.send(pdfBuffer)
}

async function evaluateMockAnswerController(req, res) {
    try {
        const { question, modelAnswer, userAnswer } = req.body

        if (!question || !modelAnswer) {
            return res.status(400).json({ message: "Question and modelAnswer are required." })
        }

        const evaluation = await evaluateAnswer({
            question,
            modelAnswer,
            userAnswer: userAnswer || ""
        })

        res.status(200).json({
            message: "Answer evaluated successfully.",
            evaluation
        })
    } catch (error) {
        console.error("Error evaluating mock answer:", error)
        res.status(500).json({
            message: error.message || "An unexpected error occurred while evaluating the answer."
        })
    }
}

async function saveMockInterviewController(req, res) {
    try {
        const { interviewReportId, type, answers, overallScore, overallFeedback } = req.body

        if (!interviewReportId || !type || !answers || answers.length === 0) {
            return res.status(400).json({ message: "interviewReportId, type, and answers are required." })
        }

        let finalScore = overallScore;
        if (answers && answers.length > 0) {
            finalScore = Math.round(answers.reduce((acc, curr) => acc + curr.score, 0) / answers.length);
        }

        let finalFeedback = overallFeedback;
        if (!finalFeedback) {
            const prompt = `Summarize the candidate's performance in a mock interview.
                            Type: ${type}
                            Questions & Answers:
                            ${answers.map((a, i) => `Q${i + 1}: ${a.question}\nAnswer: ${a.userAnswer}\nScore: ${a.score}\nFeedback: ${a.feedback}`).join('\n\n')}
                            
                            Provide a brief, professional summary of their performance, highlighting key areas they need to practice before their real interview. Keep it under 150 words.`
            
            const aiResponse = await ai.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "user", content: prompt }]
            })
            finalFeedback = aiResponse.choices[0].message.content.trim()
        }

        const mockInterview = await mockInterviewModel.create({
            user: req.user.id,
            interviewReport: interviewReportId,
            type,
            answers,
            overallScore: finalScore || 0,
            overallFeedback: finalFeedback || ""
        })

        res.status(201).json({
            message: "Mock interview session saved successfully.",
            mockInterview
        })
    } catch (error) {
        console.error("Error saving mock interview:", error)
        res.status(500).json({
            message: error.message || "An unexpected error occurred while saving the mock interview."
        })
    }
}

async function getMockInterviewHistoryController(req, res) {
    try {
        const { interviewReportId } = req.params

        const history = await mockInterviewModel.find({
            interviewReport: interviewReportId,
            user: req.user.id
        }).sort({ createdAt: -1 })

        res.status(200).json({
            message: "Mock interview history fetched successfully.",
            history
        })
    } catch (error) {
        console.error("Error fetching mock interview history:", error)
        res.status(500).json({
            message: error.message || "An unexpected error occurred while fetching mock interview history."
        })
    }
}

module.exports = { 
    generateInterViewReportController, 
    getInterviewReportByIdController, 
    getAllInterviewReportsController, 
    generateResumePdfController,
    evaluateMockAnswerController,
    saveMockInterviewController,
    getMockInterviewHistoryController
}
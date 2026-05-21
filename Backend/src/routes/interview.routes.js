const express = require("express")
const authMiddleware = require("../middlewares/auth.middleware")
const interviewController = require("../controllers/interview.controller")
const upload = require("../middlewares/file.middleware")

const interviewRouter = express.Router()



/**
 * @route POST /api/interview/
 * @description generate new interview report on the basis of user self description,resume pdf and job description.
 * @access private
 */
interviewRouter.post("/", authMiddleware.authUser, upload.single("resume"), interviewController.generateInterViewReportController)

/**
 * @route GET /api/interview/report/:interviewId
 * @description get interview report by interviewId.
 * @access private
 */
interviewRouter.get("/report/:interviewId", authMiddleware.authUser, interviewController.getInterviewReportByIdController)


/**
 * @route GET /api/interview/
 * @description get all interview reports of logged in user.
 * @access private
 */
interviewRouter.get("/", authMiddleware.authUser, interviewController.getAllInterviewReportsController)


/**
 * @route GET /api/interview/resume/pdf
 * @description generate resume pdf on the basis of user self description, resume content and job description.
 * @access private
 */
interviewRouter.post("/resume/pdf/:interviewReportId", authMiddleware.authUser, interviewController.generateResumePdfController)

/**
 * @route POST /api/interview/mock/evaluate
 * @description Evaluate a single mock interview question answer.
 * @access private
 */
interviewRouter.post("/mock/evaluate", authMiddleware.authUser, interviewController.evaluateMockAnswerController)

/**
 * @route POST /api/interview/mock/save
 * @description Save a completed mock interview practice session.
 * @access private
 */
interviewRouter.post("/mock/save", authMiddleware.authUser, interviewController.saveMockInterviewController)

/**
 * @route GET /api/interview/mock/history/:interviewReportId
 * @description Retrieve all mock interview sessions for a specific report.
 * @access private
 */
interviewRouter.get("/mock/history/:interviewReportId", authMiddleware.authUser, interviewController.getMockInterviewHistoryController)

module.exports = interviewRouter
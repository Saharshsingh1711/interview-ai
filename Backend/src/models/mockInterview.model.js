const mongoose = require('mongoose');

const mockQuestionAnswerSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    modelAnswer: {
        type: String,
        required: true
    },
    userAnswer: {
        type: String,
        default: ""
    },
    score: {
        type: Number,
        default: 0
    },
    feedback: {
        type: String,
        default: ""
    },
    strengths: [String],
    weaknesses: [String]
}, {
    _id: false
});

const mockInterviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    interviewReport: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InterviewReport",
        required: true
    },
    type: {
        type: String,
        enum: ["technical", "behavioral"],
        required: true
    },
    answers: [mockQuestionAnswerSchema],
    overallScore: {
        type: Number,
        default: 0
    },
    overallFeedback: {
        type: String,
        default: ""
    }
}, {
    timestamps: true
});

const mockInterviewModel = mongoose.model("MockInterview", mockInterviewSchema);

module.exports = mockInterviewModel;

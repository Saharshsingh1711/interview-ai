import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useInterview } from '../hooks/useInterview.js'
import { evaluateMockAnswer, saveMockInterview, getMockInterviewHistory } from '../services/interview.api'
import '../style/mockInterview.scss'

const MockInterview = () => {
    const { interviewId } = useParams()
    const navigate = useNavigate()
    const { report, getReportById, loading: reportLoading } = useInterview()

    // Screen stages: 'select' | 'interview' | 'result'
    const [step, setStep] = useState('select')
    const [mode, setMode] = useState('technical') // 'technical' | 'behavioral'
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

    // Speech synthesis & recognition
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [isListening, setIsListening] = useState(false)
    const [transcript, setTranscript] = useState("")
    const [speechError, setSpeechError] = useState(null)
    
    // Evaluation state
    const [evaluating, setEvaluating] = useState(false)
    const [currentEvaluation, setCurrentEvaluation] = useState(null)
    const [answers, setAnswers] = useState([]) // Array of evaluated answers

    // History state
    const [history, setHistory] = useState([])
    const [loadingHistory, setLoadingHistory] = useState(false)
    const [saving, setSaving] = useState(false)

    const recognitionRef = useRef(null)

    // Fetch report and history
    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
            fetchHistory()
        }
    }, [interviewId])

    const fetchHistory = async () => {
        setLoadingHistory(true)
        try {
            const data = await getMockInterviewHistory(interviewId)
            setHistory(data.history || [])
        } catch (err) {
            console.error("Error fetching history:", err)
        } finally {
            setLoadingHistory(false)
        }
    }

    // Initialize Speech Recognition
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        if (SpeechRecognition) {
            const rec = new SpeechRecognition()
            rec.continuous = true;
            rec.interimResults = true;
            rec.lang = 'en-US';

            rec.onresult = (event) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                if (finalTranscript) {
                    setTranscript(prev => (prev ? prev.trim() + " " : "") + finalTranscript.trim())
                }
            }

            rec.onend = () => {
                setIsListening(false)
            }

            rec.onerror = (e) => {
                console.error("Speech Recognition Error:", e)
                setIsListening(false)
                if (e.error === 'not-allowed') {
                    setSpeechError("Microphone permission denied. Please allow microphone access in your browser settings (click the camera/mic icon in the address bar).")
                } else if (e.error === 'audio-capture') {
                    setSpeechError("No microphone found. Please connect or enable your recording device.")
                } else if (e.error === 'network') {
                    setSpeechError("Speech recognition failed (network error). Brave browser blocks Google Speech Services by default. Please open this page in Google Chrome or Microsoft Edge instead.")
                } else if (e.error === 'no-speech') {
                    // Ignore no-speech warning to avoid UI noise when user stops talking temporarily
                } else {
                    setSpeechError(`Speech recognition failed: ${e.error}`)
                }
            }

            recognitionRef.current = rec
        }

        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop()
                } catch (err) {
                    // ignore if already stopped
                }
            }
        }
    }, [])

    if (reportLoading || !report) {
        return (
            <main className='loading-screen'>
                <h1>Loading your mock interview session...</h1>
            </main>
        )
    }

    const questions = mode === 'technical' ? report.technicalQuestions : report.behavioralQuestions;

    // Text to Speech
    const handleSpeakQuestion = (text) => {
        if ('speechSynthesis' in window) {
            if (isSpeaking) {
                window.speechSynthesis.cancel()
                setIsSpeaking(false)
                return
            }

            window.speechSynthesis.cancel() // Cancel any ongoing speech
            const utterance = new SpeechSynthesisUtterance(text)
            utterance.onend = () => setIsSpeaking(false)
            utterance.onerror = () => setIsSpeaking(false)
            setIsSpeaking(true)
            window.speechSynthesis.speak(utterance)
        } else {
            alert("Text-to-Speech is not supported in your browser.")
        }
    }

    // Speech to Text
    const handleToggleListening = async () => {
        if (!recognitionRef.current) {
            alert("Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.")
            return
        }

        setSpeechError(null)

        if (isListening) {
            recognitionRef.current.stop()
            setIsListening(false)
        } else {
            // Check for insecure context (HTTP on non-localhost hostname)
            if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
                setSpeechError("Speech recognition requires a secure connection (HTTPS) or localhost. Please access the site via HTTPS or localhost.")
                return
            }

            setIsListening(true)
            try {
                // Request mic permission explicitly to trigger browser prompt and handle denied state gracefully
                if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    stream.getTracks().forEach(track => track.stop()); // release the mic stream immediately
                }
                
                try {
                    recognitionRef.current.start()
                } catch (recErr) {
                    if (recErr.name === 'InvalidStateError') {
                        // Already started or starting, ignore
                        console.warn("SpeechRecognition already started:", recErr)
                    } else {
                        throw recErr;
                    }
                }
            } catch (err) {
                console.error("Microphone access failed:", err)
                if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                    setSpeechError("Microphone permission denied. Please allow microphone access in your browser settings (click the camera/mic icon in the address bar).")
                } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                    setSpeechError("No microphone found. Please connect or enable your recording device.")
                } else {
                    setSpeechError(`Failed to access microphone: ${err.message || err.name}`)
                }
                setIsListening(false)
            }
        }
    }

    const startInterview = (selectedMode) => {
        setMode(selectedMode)
        setCurrentQuestionIndex(0)
        setAnswers([])
        setCurrentEvaluation(null)
        setTranscript("")
        setSpeechError(null)
        setStep('interview')
    }

    const handleSubmitAnswer = async () => {
        if (!transcript.trim()) {
            alert("Please provide an answer before submitting. You can speak or type your response.")
            return
        }

        setEvaluating(true)
        try {
            const currentQuestion = questions[currentQuestionIndex]
            const response = await evaluateMockAnswer({
                question: currentQuestion.question,
                modelAnswer: currentQuestion.answer,
                userAnswer: transcript
            })

            const evalResult = {
                question: currentQuestion.question,
                modelAnswer: currentQuestion.answer,
                userAnswer: transcript,
                score: response.evaluation.score,
                feedback: response.evaluation.feedback,
                strengths: response.evaluation.strengths || [],
                weaknesses: response.evaluation.weaknesses || []
            }

            setCurrentEvaluation(evalResult)
            setAnswers(prev => [...prev, evalResult])
        } catch (err) {
            console.error("Error evaluating answer:", err)
            alert("Failed to evaluate answer. Please try again.")
        } finally {
            setEvaluating(false)
        }
    }

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1)
            setCurrentEvaluation(null)
            setTranscript("")
            setSpeechError(null)
            setIsSpeaking(false)
            window.speechSynthesis.cancel() // Stop speaking if moving next
        } else {
            handleFinishInterview()
        }
    }

    const handleFinishInterview = async () => {
        setSaving(true)
        try {
            await saveMockInterview({
                interviewReportId: interviewId,
                type: mode,
                answers: answers
            })
            setStep('result')
            fetchHistory()
        } catch (err) {
            console.error("Error saving session:", err)
            alert("Failed to save mock interview session.")
        } finally {
            setSaving(false)
        }
    }

    const handleGoBack = () => {
        window.speechSynthesis.cancel()
        navigate(`/interview/${interviewId}`)
    }

    return (
        <div className='mock-page'>
            {/* Top Navigation Header */}
            <header className='mock-header'>
                <button onClick={handleGoBack} className='back-btn'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    Back to Strategy Report
                </button>
                <h1>Mock Interview <span className='highlight'>Practice</span></h1>
                <div style={{ width: 100 }} />
            </header>

            {step === 'select' && (
                <div className='select-container'>
                    <div className='select-main'>
                        <h2>Select Interview Category</h2>
                        <p>Choose a category to start your speaking practice. We will read questions out loud, transcribe your verbal response, and grade it instantly using AI.</p>
                        
                        <div className='card-grid'>
                            <div className='mode-card' onClick={() => startInterview('technical')}>
                                <div className='mode-card__icon'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
                                </div>
                                <h3>Technical Simulator</h3>
                                <p>Practice key coding, design, and core programming concept questions tailored for this job.</p>
                                <button className='button primary-button'>Start ({report.technicalQuestions?.length} Qs)</button>
                            </div>

                            <div className='mode-card' onClick={() => startInterview('behavioral')}>
                                <div className='mode-card__icon'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                                </div>
                                <h3>Behavioral Simulator</h3>
                                <p>Practice situational, team leadership, and culture-fit questions tailored for this job.</p>
                                <button className='button primary-button'>Start ({report.behavioralQuestions?.length} Qs)</button>
                            </div>
                        </div>
                    </div>

                    <aside className='select-history'>
                        <h2>Practice History</h2>
                        {loadingHistory ? (
                            <p className='history-info'>Loading previous sessions...</p>
                        ) : history.length === 0 ? (
                            <p className='history-info'>No mock sessions recorded yet. Start your first session to build your metrics!</p>
                        ) : (
                            <div className='history-list'>
                                {history.map((session) => (
                                    <div key={session._id} className='history-card'>
                                        <div className='history-card__header'>
                                            <span className='history-type'>{session.type.toUpperCase()}</span>
                                            <span className='history-date'>{new Date(session.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className='history-card__body'>
                                            <div className='score-bar'>
                                                <span className='score-label'>Score:</span>
                                                <span className={`score-value ${session.overallScore >= 80 ? 'score--high' : session.overallScore >= 60 ? 'score--mid' : 'score--low'}`}>
                                                    {session.overallScore}%
                                                </span>
                                            </div>
                                            <p className='history-feedback'>{session.overallFeedback?.slice(0, 100)}...</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </aside>
                </div>
            )}

            {step === 'interview' && (
                <div className='practice-container'>
                    {/* Stepper progress */}
                    <div className='progress-tracker'>
                        <div className='progress-text'>Question {currentQuestionIndex + 1} of {questions.length}</div>
                        <div className='progress-bar-container'>
                            <div 
                                className='progress-bar-fill' 
                                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Question Card */}
                    <div className='practice-layout'>
                        <div className='main-panel'>
                            <div className='question-panel-card'>
                                <div className='panel-card-header'>
                                    <span className='badge badge--type'>{mode.toUpperCase()} QUESTION</span>
                                    <button 
                                        onClick={() => handleSpeakQuestion(questions[currentQuestionIndex].question)} 
                                        className={`speak-btn ${isSpeaking ? 'speaking' : ''}`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            {isSpeaking ? (
                                                <>
                                                    <rect x="4" y="4" width="16" height="16" rx="2"></rect>
                                                </>
                                            ) : (
                                                <>
                                                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                                                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                                                </>
                                            )}
                                        </svg>
                                        {isSpeaking ? 'Stop Reading' : 'Speak Question'}
                                    </button>
                                </div>
                                <h2 className='question-text'>{questions[currentQuestionIndex].question}</h2>
                            </div>

                            {/* Response Recording Panel */}
                            <div className='recording-panel-card'>
                                <h3>Your Answer</h3>
                                <div className='controls-wrapper'>
                                    <button 
                                        onClick={handleToggleListening} 
                                        className={`mic-btn ${isListening ? 'listening' : ''}`}
                                        disabled={evaluating}
                                    >
                                        <span className='mic-ring'></span>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                                            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                                            <line x1="12" y1="19" x2="12" y2="23"></line>
                                            <line x1="8" y1="23" x2="16" y2="23"></line>
                                        </svg>
                                        {isListening ? 'Listening... Click to Pause' : 'Start Speaking Response'}
                                    </button>
                                </div>

                                {speechError && (
                                    <div className='speech-error-message fade-in'>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                                        <span>{speechError}</span>
                                    </div>
                                )}

                                <textarea
                                    value={transcript}
                                    onChange={(e) => setTranscript(e.target.value)}
                                    placeholder="Type or click the microphone to speak your response here. Feel free to edit the transcript if needed before submitting."
                                    className='response-textarea'
                                    disabled={evaluating || currentEvaluation}
                                />

                                {!currentEvaluation && (
                                    <div className='action-footer'>
                                        <button 
                                            onClick={handleSubmitAnswer} 
                                            disabled={evaluating || !transcript.trim()} 
                                            className='button primary-button submit-btn'
                                        >
                                            {evaluating ? (
                                                <>
                                                    <span className='spinner'></span> Evaluating...
                                                </>
                                            ) : 'Submit Answer for AI Evaluation'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right sidebar for evaluation details */}
                        <div className='evaluation-panel'>
                            {evaluating && (
                                <div className='eval-loading'>
                                    <div className='spinner spinner--large'></div>
                                    <h3>Analyzing Response...</h3>
                                    <p>Evaluating grammar, content relevance, structural completeness, and matching key components.</p>
                                </div>
                            )}

                            {!evaluating && !currentEvaluation && (
                                <div className='eval-placeholder'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                                    <h3>Awaiting Submission</h3>
                                    <p>Speak or write your answer and click submit. The AI will evaluate it and show a score and constructive suggestions here.</p>
                                </div>
                            )}

                            {!evaluating && currentEvaluation && (
                                <div className='eval-results fade-in'>
                                    <div className='score-ring-wrapper'>
                                        <div className={`score-ring ${currentEvaluation.score >= 80 ? 'score--high' : currentEvaluation.score >= 60 ? 'score--mid' : 'score--low'}`}>
                                            <span className='score-num'>{currentEvaluation.score}</span>
                                            <span className='score-percent'>%</span>
                                        </div>
                                        <h4>Question Score</h4>
                                    </div>

                                    <div className='eval-section'>
                                        <h5>Feedback</h5>
                                        <p>{currentEvaluation.feedback}</p>
                                    </div>

                                    {currentEvaluation.strengths?.length > 0 && (
                                        <div className='eval-section'>
                                            <h5>Key Strengths</h5>
                                            <ul className='strengths-list'>
                                                {currentEvaluation.strengths.map((str, idx) => (
                                                    <li key={idx}>✅ {str}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {currentEvaluation.weaknesses?.length > 0 && (
                                        <div className='eval-section'>
                                            <h5>Areas for Improvement</h5>
                                            <ul className='weaknesses-list'>
                                                {currentEvaluation.weaknesses.map((weak, idx) => (
                                                    <li key={idx}>⚠️ {weak}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    <div className='eval-section model-answer-section'>
                                        <h5>Expected Model Answer</h5>
                                        <p>{currentEvaluation.modelAnswer}</p>
                                    </div>

                                    <button 
                                        onClick={handleNextQuestion} 
                                        className='button primary-button next-btn'
                                        disabled={saving}
                                    >
                                        {saving ? 'Saving attempt...' : currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish & View Summary'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {step === 'result' && (
                <div className='summary-container fade-in'>
                    <div className='summary-card'>
                        <h2>Interview Summary</h2>
                        <p className='summary-intro'>
                            You have completed the mock session. Here is a high-level view of your performance across all answers.
                        </p>

                        <div className='summary-stats'>
                            <div className='stat-item'>
                                <span className='stat-label'>Category</span>
                                <span className='stat-value highlight'>{mode.toUpperCase()}</span>
                            </div>
                            <div className='stat-item'>
                                <span className='stat-label'>Questions Answered</span>
                                <span className='stat-value'>{answers.length}</span>
                            </div>
                            <div className='stat-item'>
                                <span className='stat-label'>Overall Score</span>
                                <span className={`stat-value ${Math.round(answers.reduce((acc, curr) => acc + curr.score, 0) / answers.length) >= 80 ? 'score--high' : Math.round(answers.reduce((acc, curr) => acc + curr.score, 0) / answers.length) >= 60 ? 'score--mid' : 'score--low'}`}>
                                    {Math.round(answers.reduce((acc, curr) => acc + curr.score, 0) / answers.length)}%
                                </span>
                            </div>
                        </div>

                        <div className='summary-feedback-block'>
                            <h3>Overall Practice Feedback</h3>
                            <p>
                                {answers.length > 0 ? (
                                    "Your mock session attempt has been saved successfully. Head back to practice history to view dynamic overall comments or review individual question transcripts below."
                                ) : "No answers submitted."}
                            </p>
                        </div>

                        <div className='breakdown-list'>
                            <h3>Question-by-Question Breakdown</h3>
                            {answers.map((ans, idx) => (
                                <div key={idx} className='breakdown-card'>
                                    <div className='breakdown-card__header'>
                                        <h4>Q{idx + 1}: {ans.question}</h4>
                                        <span className={`breakdown-score ${ans.score >= 80 ? 'score--high' : ans.score >= 60 ? 'score--mid' : 'score--low'}`}>
                                            {ans.score}%
                                        </span>
                                    </div>
                                    <div className='breakdown-card__body'>
                                        <p><strong>Your Spoken Response:</strong> "{ans.userAnswer}"</p>
                                        <p><strong>Feedback:</strong> {ans.feedback}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className='summary-actions'>
                            <button onClick={() => setStep('select')} className='button secondary-button'>Take Another Session</button>
                            <button onClick={handleGoBack} className='button primary-button'>Back to Strategy Report</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default MockInterview

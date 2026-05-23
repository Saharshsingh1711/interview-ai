import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../../auth/hooks/useAuth'
import { useTheme } from '../../../hooks/useTheme'
import { Button } from '../../../components/ui/button'
import { HeroSection } from '../../../components/ui/hero-4'
import '../style/landing.scss'

const LandingPage = () => {
    const { user, loading } = useAuth()
    const { theme, toggleTheme } = useTheme()
    const navigate = useNavigate()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [activeFaq, setActiveFaq] = useState(null)

    const animatedTexts = [
        "with AI Study Roadmaps",
        "through Interactive Mocks",
        "by scanning Job Skill Gaps",
        "with Actionable AI Feedback"
    ];
    const [textIndex, setTextIndex] = useState(0);
    const [displayText, setDisplayText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    React.useEffect(() => {
        const fullText = animatedTexts[textIndex];

        const handleTyping = () => {
            if (isDeleting) {
                setDisplayText((prev) => prev.substring(0, prev.length - 1));
            } else {
                setDisplayText((prev) => fullText.substring(0, prev.length + 1));
            }
        };

        const typingSpeed = isDeleting ? 75 : 150;
        const typeInterval = setInterval(handleTyping, typingSpeed);

        if (!isDeleting && displayText === fullText) {
            setTimeout(() => setIsDeleting(true), 2000);
        } else if (isDeleting && displayText === "") {
            setIsDeleting(false);
            setTextIndex((prev) => (prev + 1) % animatedTexts.length);
        }

        return () => clearInterval(typeInterval);
    }, [displayText, isDeleting, textIndex]);

    const toggleFaq = (index) => {
        if (activeFaq === index) {
            setActiveFaq(null)
        } else {
            setActiveFaq(index)
        }
    }

    const handleCtaClick = () => {
        if (user) {
            navigate('/dashboard')
        } else {
            navigate('/register')
        }
    }

    const faqs = [
        {
            question: "How does the AI create my interview plan?",
            answer: "Our advanced AI model analyzes the target job description (which contains key skills, keywords, and responsibilities) and aligns it against your uploaded resume or self-description. It then isolates the gaps and crafts a step-by-step roadmap tailored specifically to secure that position."
        },
        {
            question: "Is my resume data secure?",
            answer: "Absolutely. We prioritize your privacy above all else. Your uploaded resume is securely parsed solely to generate your interview roadmap. We never share your personal information or resume contents with third parties."
        },
        {
            question: "How do mock interviews work?",
            answer: "Once your strategy is generated, you can launch an interactive Mock Interview. The AI dynamically generates highly relevant, contextual questions based on your roadmap. You input your answers, and our system scores your performance with precise feedback on how to improve."
        },
        {
            question: "Is Interview AI free to use?",
            answer: "Currently, Interview AI is in an open beta stage. You can generate unlimited custom interview plans, take mock interviews, and receive complete feedback reports entirely for free!"
        }
    ]
    const avatarData = [
        {
            src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80",
            alt: "User A",
            fallback: "A",
        },
        {
            src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80",
            alt: "User B",
            fallback: "B",
        },
        {
            src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80",
            alt: "User C",
            fallback: "C",
        },
    ]

    return (
        <div className="landing-container">
            {/* Ambient Background Glowing Blobs */}
            <div className="glow-blob glow-blob--1"></div>
            <div className="glow-blob glow-blob--2"></div>
            <div className="glow-blob glow-blob--3"></div>

            {/* Header / Navigation Bar */}
            <nav className="navbar">
                <Link to="/" className="logo-container">
                    <div className="logo-icon">i</div>
                    <span className="logo-text">Interview <span className="highlight-brand">AI</span></span>
                </Link>

                <div className="nav-links">
                    <a href="#hero">Home</a>
                    <a href="#features">Features</a>
                    <a href="#about">About</a>
                    <a href="#faq">FAQ</a>
                </div>

                <div className="nav-actions">
                    <button 
                        onClick={toggleTheme} 
                        className="btn-theme-toggle"
                        title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        aria-label="Toggle light/dark theme"
                    >
                        {theme === 'dark' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="5"></circle>
                                <line x1="12" y1="1" x2="12" y2="3"></line>
                                <line x1="12" y1="21" x2="12" y2="23"></line>
                                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                                <line x1="1" y1="12" x2="3" y2="12"></line>
                                <line x1="21" y1="12" x2="23" y2="12"></line>
                                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                            </svg>
                        )}
                    </button>

                    {loading ? (
                        <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Loading...</span>
                    ) : user ? (
                        <Link to="/dashboard" className="btn-cta">Go to Dashboard</Link>
                    ) : (
                        <>
                            <Link to="/login" className="btn-login">Log In</Link>
                            <Link to="/register" className="btn-cta">Get Started</Link>
                        </>
                    )}
                </div>

                <div className="mobile-nav-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button 
                        onClick={toggleTheme} 
                        className="btn-theme-toggle mobile-theme-toggle"
                        title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        aria-label="Toggle light/dark theme"
                    >
                        {theme === 'dark' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="5"></circle>
                                <line x1="12" y1="1" x2="12" y2="3"></line>
                                <line x1="12" y1="21" x2="12" y2="23"></line>
                                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                                <line x1="1" y1="12" x2="3" y2="12"></line>
                                <line x1="21" y1="12" x2="23" y2="12"></line>
                                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                            </svg>
                        )}
                    </button>

                    <button 
                        className="mobile-menu-toggle"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle Navigation Menu"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            {mobileMenuOpen ? (
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                            ) : (
                                <>
                                    <line x1="3" y1="12" x2="21" y2="12"></line>
                                    <line x1="3" y1="6" x2="21" y2="6"></line>
                                    <line x1="3" y1="18" x2="21" y2="18"></line>
                                </>
                            )}
                        </svg>
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Drawer */}
            {mobileMenuOpen && (
                <div className="mobile-drawer">
                    <a href="#hero" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Home</a>
                    <a href="#features" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Features</a>
                    <a href="#about" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>About</a>
                    <a href="#faq" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
                    
                    <div className="mobile-actions">
                        {user ? (
                            <Link to="/dashboard" className="btn-mobile-cta" onClick={() => setMobileMenuOpen(false)}>Go to Dashboard</Link>
                        ) : (
                            <>
                                <Link to="/login" className="btn-mobile-login" onClick={() => setMobileMenuOpen(false)}>Log In</Link>
                                <Link to="/register" className="btn-mobile-cta" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Hero Section */}
            <section id="hero" className="section hero-section">
                <div className="hero-grid">
                    <div className="hero-content">
                        <div className="hero-tagline animate-slide-up">
                            <span></span> AI Interview Strategies - 100% Personalised
                        </div>
                        <h1 className="animate-slide-up delay-75">
                            Master Your Next Interview <br/>
                            <span className="relative mt-3 inline-block w-fit">
                                {/* Dashed border effect */}
                                <span className="absolute inset-0 -z-10 -m-3">
                                    <span className="absolute inset-0 border-2 border-dashed border-primary rounded-2xl opacity-60" style={{ borderColor: '#a855f7' }}></span>
                                </span>
                                {/* Animated Text */}
                                <span className="highlight-text min-h-[1.2em] inline-block px-4">
                                    {displayText}
                                    <span className="animate-pulse">|</span>
                                </span>
                            </span>
                        </h1>
                        <p className="hero-desc animate-slide-up delay-150">
                            Don't walk into your next interview unprepared. Upload any job description and your resume to receive a customized study roadmap, practice mock interviews, and get actionable AI-driven feedback in seconds.
                        </p>
                        
                        <div className="hero-buttons animate-slide-up delay-200">
                            <Button 
                                onClick={handleCtaClick} 
                                className="btn-primary border-none shadow-lg gap-2 text-white font-semibold cursor-pointer"
                                style={{
                                    background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                                    padding: '15px 32px',
                                    height: 'auto',
                                    borderRadius: '12px',
                                }}
                            >
                                {user ? "Go to Dashboard" : "Start Preparing for Free"}
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                    <polyline points="12 5 19 12 12 19"></polyline>
                                </svg>
                            </Button>
                            <a href="#features" className="btn-secondary">Explore Features</a>
                        </div>

                        <div className="hero-trust animate-slide-up delay-300">
                            <p>Supercharge interviews at top levels</p>
                            <div className="company-logos">
                                <span>FAANG</span>
                                <span>Startups</span>
                                <span>Fortune 500</span>
                            </div>
                        </div>
                    </div>

                    <div className="hero-visual animate-slide-right delay-200">
                        <div className="visual-glow"></div>
                        <div className="visual-dashboard">
                            <div className="mock-header">
                                <div className="dots">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                                <span className="mock-title">AI Preparation Strategy Dashboard</span>
                            </div>

                            <div className="mock-stats">
                                <div className="stat-item">
                                    <div className="label">Profile &amp; Job Description Match</div>
                                    <div className="value-container">
                                        <span className="value">92% Align</span>
                                        <span className="percentage up">+15% vs Average</span>
                                    </div>
                                </div>

                                <div className="stat-item">
                                    <div className="label">AI Key Focus Areas</div>
                                    <div className="value-container">
                                        <span className="value" style={{ fontSize: '0.95rem', fontWeight: 600 }}>System Design &amp; React Hooks</span>
                                        <span className="percentage" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>High Priority</span>
                                    </div>
                                </div>
                            </div>

                            {/* Simulated CSS Chart */}
                            <div className="mock-chart">
                                <div className="chart-bar" style={{ height: '40%' }}></div>
                                <div className="chart-bar" style={{ height: '75%' }}></div>
                                <div className="chart-bar" style={{ height: '55%' }}></div>
                                <div className="chart-bar" style={{ height: '90%' }}></div>
                                <div className="chart-bar" style={{ height: '65%' }}></div>
                                <div className="chart-bar" style={{ height: '80%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="section">
                <div className="section__header animate-slide-up">
                    <span className="badge">Platform Features</span>
                    <h2>Engineered for Job Seekers</h2>
                    <p>Standard templates won't get you hired. Our platform creates a laser-focused prep environment tailored specifically for you.</p>
                </div>

                <div className="features-grid">
                    <div className="feature-card animate-slide-up delay-75">
                        <div className="feature-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        </div>
                        <h3>Custom Study Roadmaps</h3>
                        <p>Upload a PDF or Word resume alongside target requirements. Get a visual priority guide indicating exactly what to study.</p>
                    </div>

                    <div className="feature-card animate-slide-up delay-150">
                        <div className="feature-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                        </div>
                        <h3>Interactive Mocks</h3>
                        <p>Practice writing or reciting answers to challenging interview questions custom-generated for the position.</p>
                    </div>

                    <div className="feature-card animate-slide-up delay-200">
                        <div className="feature-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                        </div>
                        <h3>Analytical Scorecards</h3>
                        <p>Receive dynamic evaluation metrics. Identify exactly where your vocabulary, experience, or delivery can be polished.</p>
                    </div>

                    <div className="feature-card animate-slide-up delay-300">
                        <div className="feature-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>
                        </div>
                        <h3>Confidence Booster</h3>
                        <p>Simulating real stress questions builds critical cognitive reflexes, preparing you to answer confidently in real-world loops.</p>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="section about-section">
                <div className="about-grid">
                    <div className="about-visual animate-slide-left delay-75">
                        <div className="about-graphic">
                            <div className="graphic-node">
                                <div className="node-dot">1</div>
                                <div className="node-details">
                                    <h4>Profile Extraction</h4>
                                    <p>AI scans and indexes your resume qualifications.</p>
                                </div>
                            </div>
                            <div className="graphic-node">
                                <div className="node-dot">2</div>
                                <div className="node-details">
                                    <h4>Skill Gap Analysis</h4>
                                    <p>Identifies differences between profile and job description.</p>
                                </div>
                            </div>
                            <div className="graphic-node">
                                <div className="node-dot">3</div>
                                <div className="node-details">
                                    <h4>Strategic Plan Created</h4>
                                    <p>Generates tailored focus items, mocks, and feedback.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="about-content animate-slide-right delay-75">
                        <span className="badge-about">About The Platform</span>
                        <h2>Bridging the Gap Between Preparation and Confidence</h2>
                        <p>
                            Interviewing is highly nerve-wracking. Preparing with generic questions online feels unproductive and doesn't target the actual job. We created **Interview AI** to solve this problem.
                        </p>
                        <p>
                            Our platform analyzes the exact syntax, skills, and expectations of your target job description. We compare it with your unique professional history to generate laser-focused training plans. This ensures you spend 100% of your time studying things that matter.
                        </p>

                        <div className="about-stats">
                            <div className="about-stat">
                                <div className="num">94%</div>
                                <div className="lbl">Confidence Lift</div>
                            </div>
                            <div className="about-stat">
                                <div className="num">10k+</div>
                                <div className="lbl">Plans Created</div>
                            </div>
                            <div className="about-stat">
                                <div className="num">5x</div>
                                <div className="lbl">Preparation Speed</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="section">
                <div className="section__header animate-slide-up">
                    <span className="badge">Common Questions</span>
                    <h2>Have Questions? We Have Answers</h2>
                    <p>Learn more about how Interview AI works and how it helps you secure your next role.</p>
                </div>

                <div className="faq-container">
                    {faqs.map((faq, index) => (
                        <div 
                            key={index} 
                            className={`faq-item animate-slide-up ${activeFaq === index ? 'active' : ''}`}
                            style={{ animationDelay: `${(index + 1) * 100}ms` }}
                        >
                            <button className="faq-trigger" onClick={() => toggleFaq(index)}>
                                <span>{faq.question}</span>
                                <span className="faq-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                </span>
                            </button>
                            <div className={`faq-content ${activeFaq === index ? 'open' : ''}`}>
                                <p>{faq.answer}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="section cta-section">
                <div className="cta-card animate-slide-up delay-100">
                    <h2>Ready to Land Your Dream Job?</h2>
                    <p>Join thousands of candidates who used Interview AI to identify skill gaps, master mock sessions, and clear interviews with complete confidence.</p>
                    <div className="cta-buttons">
                        <Button 
                            onClick={handleCtaClick} 
                            className="btn-cta-main border-none shadow-lg font-bold cursor-pointer text-white"
                            style={{
                                background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                                padding: '16px 36px',
                                height: 'auto',
                                borderRadius: '12px',
                            }}
                        >
                            {user ? "Go to Dashboard" : "Create My Free Strategy"}
                        </Button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <div className="logo">
                            <div className="logo-icon">i</div>
                            <span className="logo-text">Interview AI</span>
                        </div>
                        <p>Leveraging cutting edge AI to build premium strategy roadmaps that help candidates clear tech loops with absolute ease.</p>
                    </div>

                    <div className="footer-links">
                        <h4>Platform</h4>
                        <ul>
                            <li><a href="#hero">Home</a></li>
                            <li><a href="#features">Features</a></li>
                            <li><a href="#about">About</a></li>
                            <li><a href="#faq">FAQ</a></li>
                        </ul>
                    </div>

                    <div className="footer-links">
                        <h4>Support</h4>
                        <ul>
                            <li><a href="#">Help Center</a></li>
                            <li><a href="#">Beta Feedback</a></li>
                            <li><a href="#">System Status</a></li>
                        </ul>
                    </div>

                    <div className="footer-links">
                        <h4>Legal</h4>
                        <ul>
                            <li><a href="#">Privacy Policy</a></li>
                            <li><a href="#">Terms of Service</a></li>
                            <li><a href="#">Data Privacy</a></li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; 2026 Interview AI. Created by Saharsh Singh. All rights reserved.</p>
                    <div className="socials">
                        <a href="#">Twitter</a>
                        <a href="#">LinkedIn</a>
                        <a href="#">GitHub</a>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default LandingPage

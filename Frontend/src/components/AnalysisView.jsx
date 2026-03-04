import React, { useEffect, useState } from 'react';

const AnalysisView = ({ data, onReset, user }) => {
    const [animatedScore, setAnimatedScore] = useState(0);

    const {
        candidateName,
        overallScore,
        concerns,
        keyStrengths,
        interviewFocus
    } = data;

    // Animate score on load
    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimatedScore(overallScore);
        }, 300);
        return () => clearTimeout(timer);
    }, [overallScore]);

    // Derived generic sub-scores based on main score for UI mockup purposes
    const contentScore = Math.min(100, overallScore - 15);
    const personalInfoScore = Math.min(100, overallScore + 10);
    const skillsScore = Math.min(100, Math.max(overallScore, 70));
    const expScore = Math.max(0, overallScore - 20);

    const getScoreBadge = (score) => {
        if (score >= 80) return <span className="badge badge-excellent">Excellent</span>;
        if (score >= 60) return <span className="badge badge-good">Good</span>;
        if (score >= 40) return <span className="badge badge-average">Average</span>;
        return <span className="badge badge-bad">Bad</span>;
    };

    const getScoreText = (score) => {
        if (score >= 80) return "Excellent fit for this role";
        if (score >= 60) return "Good, but needs improvement";
        if (score >= 40) return "Average, considerable gaps found";
        return "Not recommended based on current resume";
    };

    // Calculate SVG circle properties
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

    return (
        <div className="app-card animate-fade-in stagger-1">
            <div className="profile-badge" style={{ margin: '0 0 2rem 0' }}>
                <img
                    src={`https://api.dicebear.com/7.x/bottts/svg?seed=analyzer&backgroundColor=e2e8f0`}
                    alt="Bot Profile"
                    className="profile-avatar"
                />
                <span>Resume Analyzer</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '4rem', alignItems: 'start' }}>

                {/* LEFT COLUMN: SCORE VIEW */}
                <div>
                    <h3 className="heading-md" style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Your Resume Score</h3>

                    <div className="dashed-score-box">
                        <div style={{ fontSize: '4rem', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1, marginBottom: '0.5rem' }}>
                            {overallScore} <span style={{ fontSize: '2rem', color: 'var(--text-secondary)' }}>/ 100</span>
                        </div>
                        <p style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '1rem' }}>
                            {getScoreText(overallScore)}
                        </p>
                    </div>

                    <div className="score-circle-container">
                        <svg className="score-circle-svg" viewBox="0 0 140 140">
                            <circle className="score-circle-bg" cx="70" cy="70" r={radius} />
                            <circle
                                className="score-circle-progress"
                                cx="70"
                                cy="70"
                                r={radius}
                                style={{
                                    strokeDasharray: circumference,
                                    strokeDashoffset: strokeDashoffset
                                }}
                            />
                        </svg>
                        <div className="score-circle-text">
                            {animatedScore} / 100
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '2.5rem' }}>
                        <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '12px' }}>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Content</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '1.5rem', fontWeight: '800' }}>{contentScore}</span>
                                {getScoreBadge(contentScore)}
                            </div>
                        </div>
                        <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '12px' }}>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Personal Info</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '1.5rem', fontWeight: '800' }}>{personalInfoScore}</span>
                                {getScoreBadge(personalInfoScore)}
                            </div>
                        </div>
                        <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '12px' }}>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Skills</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '1.5rem', fontWeight: '800' }}>{skillsScore}</span>
                                {getScoreBadge(skillsScore)}
                            </div>
                        </div>
                        <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '12px' }}>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Experience</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '1.5rem', fontWeight: '800' }}>{expScore}</span>
                                {getScoreBadge(expScore)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: SUGGESTIONS VIEW */}
                <div className="stagger-2">
                    <h3 className="heading-md" style={{ marginBottom: '1.5rem', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>✨</span> AI Suggestions
                    </h3>

                    {/* Turn concerns/focus into actionable cards */}
                    {(concerns && concerns.length > 0 ? concerns : interviewFocus).slice(0, 3).map((item, index) => (
                        <div className="ai-suggestion-card" key={index} style={{
                            background: index === 0 ? 'var(--accent-gradient)' : index === 1 ? 'linear-gradient(135deg, #6366f1, #3b82f6)' : 'linear-gradient(135deg, #8b5cf6, #6366f1)'
                        }}>
                            <h4>{index === 0 ? "Improve keyword matching" : index === 1 ? "Add measurable achievements" : "Optimize resume details"}</h4>
                            <p>{item}</p>
                            <button className="btn-pro">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                </svg>
                                Try Pro Plan
                            </button>
                        </div>
                    ))}

                    <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f9fafb', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>More people use this to improve their resume</h4>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Join thousands of job seekers who improved their resume with AI suggestions.</p>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex' }}>
                                {[1, 2, 3, 4, 5].map(i => (
                                    <img key={i} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`} alt="user" style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid white', marginLeft: i > 1 ? '-12px' : '0', background: '#e2e8f0' }} />
                                ))}
                            </div>
                            <span style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-secondary)' }}>+23K</span>
                        </div>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                        <button className="btn btn-outline" onClick={onReset} style={{ width: '100%', padding: '1.25rem', fontSize: '1.1rem' }}>
                            Analyze Another Resume
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AnalysisView;

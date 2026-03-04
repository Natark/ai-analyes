import React, { useState, useRef } from 'react';

const ResumeInput = ({ onAnalyze, isAnalyzing, user }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [fileName, setFileName] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedFile && !isAnalyzing) {
            onAnalyze({ file: selectedFile });
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleFileSelect(files[0]);
        }
    };

    const handleFileSelect = (file) => {
        setFileName(file.name);
        setSelectedFile(file);
    };

    const triggerFileSelect = () => {
        fileInputRef.current.click();
    };

    return (
        <div className="app-card animate-fade-in">
            {/* Top Profile Badge */}
            <div className="profile-badge" style={{ margin: '0 0 2rem 0' }}>
                <img
                    src={`https://api.dicebear.com/7.x/bottts/svg?seed=analyzer&backgroundColor=e2e8f0`}
                    alt="Bot Profile"
                    className="profile-avatar"
                />
                <span>Resume Analyzer</span>
            </div>

            <div style={{ marginBottom: '2.5rem' }}>
                <h2 className="heading-lg" style={{ fontSize: '2rem' }}>Upload your Resume</h2>
                <p className="text-muted" style={{ fontSize: '1rem' }}>Let AI analyze your resume in seconds</p>
            </div>

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '3rem', alignItems: 'start' }}>

                    {/* LEFT COLUMN: Upload Zone */}
                    <div>
                        <div
                            className={`upload-zone ${isDragging ? 'dragging' : ''}`}
                            onClick={triggerFileSelect}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            style={{ height: '320px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                                style={{ display: 'none' }}
                                accept=".pdf,.doc,.docx"
                            />

                            {fileName ? (
                                <div className="animate-fade-in">
                                    <div className="upload-icon-container" style={{ background: 'var(--success)' }}>
                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    </div>
                                    <h3 className="heading-md" style={{ marginBottom: '0.2rem', fontSize: '1.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fileName}</h3>
                                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>Ready to analyze</p>
                                </div>
                            ) : (
                                <div>
                                    <div className="upload-icon-container">
                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                            <polyline points="17 8 12 3 7 8" />
                                            <line x1="12" y1="3" x2="12" y2="15" />
                                        </svg>
                                    </div>
                                    <h3 className="heading-md" style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                                        Drag & drop your resume
                                    </h3>
                                    <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                        PDF or DOCX · Max 5MB
                                    </p>
                                    <span className="btn btn-primary" style={{ padding: '0.75rem 2rem', width: 'auto', fontSize: '1rem', pointerEvents: 'none' }}>
                                        Browse File
                                    </span>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={!fileName || isAnalyzing}
                            style={{ fontSize: '1.15rem', padding: '1.25rem' }}
                        >
                            {isAnalyzing ? 'Analyzing...' : 'Analyze Resume'}
                        </button>
                    </div>

                    {/* RIGHT COLUMN: What AI Checks */}
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div className="action-list" style={{ padding: '2rem', marginBottom: '1.5rem', background: 'white' }}>
                            <h4 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1rem' }}>What AI checks</h4>

                            <div className="action-list-item" style={{ padding: '1rem 0' }}>
                                <div className="action-list-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <polyline points="12 16 16 12 12 8"></polyline>
                                        <line x1="8" y1="12" x2="16" y2="12"></line>
                                    </svg>
                                </div>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>ATS compatibility parsing</span>
                            </div>

                            <div className="action-list-item" style={{ padding: '1rem 0' }}>
                                <div className="action-list-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="20" x2="18" y2="10"></line>
                                        <line x1="12" y1="20" x2="12" y2="4"></line>
                                        <line x1="6" y1="20" x2="6" y2="14"></line>
                                    </svg>
                                </div>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>Skill & keyword matching</span>
                            </div>

                            <div className="action-list-item" style={{ padding: '1rem 0', borderBottom: 'none' }}>
                                <div className="action-list-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                        <polyline points="14 2 14 8 20 8"></polyline>
                                        <line x1="16" y1="13" x2="8" y2="13"></line>
                                        <line x1="16" y1="17" x2="8" y2="17"></line>
                                        <polyline points="10 9 9 9 8 9"></polyline>
                                    </svg>
                                </div>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>Content formatting & HR readability</span>
                            </div>
                        </div>

                        {/* Blurred Placeholder */}
                        <div className="blur-banner" style={{ padding: '1.5rem' }}>
                            <h3 style={{ fontSize: '2.5rem' }}>72/100</h3>
                            <p style={{ fontWeight: '600', color: 'var(--text-secondary)', fontSize: '1rem' }}>Upload resume to see score</p>
                        </div>
                    </div>

                </div>
            </form>
        </div>
    );
};

export default ResumeInput;

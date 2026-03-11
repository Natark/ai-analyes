import React, { useState } from 'react';
import ResumeInput from './components/ResumeInput';
import AnalysisView from './components/AnalysisView';


import LoginPage from './components/LoginPage';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [view, setView] = useState('input'); // input, analyzing, result
  const [analysisData, setAnalysisData] = useState(null);

  // Set the base URL for API requests.
  // In local development, vite proxies requests via vite.config.js if this is empty.
  // In production (Netlify), this can be set to the deployed backend URL (e.g. Render).
  const rawApiBase = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const API_BASE = rawApiBase.replace(/\/+$/, '');

  const handleLogin = async (userData) => {
    try {
      const response = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userData.name,
          email: userData.phone,
          password: userData.phone
        })
      });
      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setIsLoggedIn(true);
      } else {
        alert("Login failed: " + data.message);
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("Unable to connect to login server.");
    }
  };

  const handleAnalyze = async (inputData) => {
    setView('analyzing');

    try {
      let response;

      // Check if input is a file object or raw text string
      if (typeof inputData === 'object' && inputData.file) {
        // Handle File Upload
        const formData = new FormData();
        formData.append('resume', inputData.file);

        response = await fetch(`${API_BASE}/api/analyze-upload`, {
          method: 'POST',
          body: formData, // fetch adds multipart header automatically
        });
      } else {
        // Handle Text Input
        const textToAnalyze = typeof inputData === 'string' ? inputData : inputData.text;
        response = await fetch(`${API_BASE}/api/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: textToAnalyze })
        });
      }

      const result = await response.json();

      if (result.success) {
        setAnalysisData(result.data);
        setView('result');
      } else {
        console.error(result.message);
        alert("Analysis failed: " + result.message);
        setView('input');
      }
    } catch (error) {
      console.error("Analysis Error:", error);
      alert("Server error. Please check backend connection.");
      setView('input');
    }
  };

  const handleReset = () => {
    setAnalysisData(null);
    setView('input');
  };

  return (
    <div className="App" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>

      <main style={{ width: '100%' }}>

        {!isLoggedIn ? (
          <LoginPage onLogin={handleLogin} />
        ) : (
          <>
            {view === 'input' && (
              <ResumeInput onAnalyze={handleAnalyze} isAnalyzing={false} user={user} />
            )}

            {view === 'analyzing' && (
              <div className="animate-fade-in" style={{
                textAlign: 'center',
                padding: '4rem 0',
                color: 'white'
              }}>
                <div style={{ marginBottom: '2rem' }}>
                  <div className="spinner" style={{
                    width: '64px',
                    height: '64px',
                    border: '4px solid rgba(255,255,255,0.2)',
                    borderTopColor: 'var(--accent-secondary)',
                    borderRadius: '50%',
                    margin: '0 auto',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                </div>
                <h2 className="heading-xl" style={{ color: 'white' }}>Analyzing Profile...</h2>
                <p style={{ opacity: 0.9, fontSize: '1.1rem' }}>Extracting skills, validating experience...</p>
              </div>
            )}

            {view === 'result' && analysisData && (
              <AnalysisView data={analysisData} onReset={handleReset} user={user} />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;

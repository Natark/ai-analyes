import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParseModule = require('pdf-parse');
const pdfParse = pdfParseModule.PDFParse || pdfParseModule.default || pdfParseModule;
const sqlite3 = require('sqlite3');
import { open } from 'sqlite';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
const mammoth = require('mammoth');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// File Upload Configuration - Using /tmp for serverless (Vercel) compatibility
const upload = multer({ dest: '/tmp/uploads/' });

// Database Setup
let db;
(async () => {
    try {
        db = await open({
            filename: '/tmp/database.sqlite', // Use /tmp for serverless
            driver: sqlite3.Database
        });

        await db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                email TEXT UNIQUE,
                password TEXT,
                role TEXT DEFAULT 'recruiter'
            );
            
            CREATE TABLE IF NOT EXISTS analyses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                candidate_name TEXT,
                role_detected TEXT,
                overall_score INTEGER,
                analysis_json TEXT, -- JSON string
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES users(id)
            );
        `);
        console.log("Connected to SQLite database.");
    } catch (err) {
        console.error("Database initialization failed:", err);
    }
})();

// Gemini AI Configuration
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_API_KEY_HERE");

// Helper: Extract text from PDF
const extractTextFromPDF = async (filePath) => {
    let parser = null;
    try {
        const dataBuffer = fs.readFileSync(filePath);
        // Using pdf-parse v2+ syntax
        parser = new pdfParse({ data: dataBuffer });
        const data = await parser.getText();
        return data.text;
    } catch (e) {
        console.error("PDF Parse Error:", e);
        throw new Error("Failed to parse PDF: " + e.message);
    } finally {
        if (parser && typeof parser.destroy === 'function') {
            await parser.destroy();
        }
    }
};

// Helper: Extract text from DOCX
const extractTextFromDocx = async (filePath) => {
    try {
        const result = await mammoth.extractRawText({ path: filePath });
        return result.value;
    } catch (e) {
        console.error("DOCX Parse Error:", e);
        throw new Error("Failed to parse DOCX: " + e.message);
    }
};

// Helper: Analyze user text with Gemini
const analyzeWithGemini = async (resumeText) => {
    const apiKey = process.env.GEMINI_API_KEY;
    // Check if key is missing OR is the default placeholder
    if (!apiKey || apiKey === "YOUR_API_KEY_HERE" || apiKey.includes("YOUR_API")) {
        console.log("Using Mock Data (Invalid or Missing API Key)");
        return generateMockAnalysis(resumeText);
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `
            Analyze the following resume text and return a valid JSON object strictly matching this structure:
            {
                "candidateName": "String",
                "roleDetected": "String",
                "overallScore": Number (0-100),
                "overview": "String summary",
                "keyStrengths": ["String", "String", ...],
                "experienceAssessment": {
                    "yearsOfExperience": Number,
                    "progression": "String",
                    "relevance": "String",
                    "summary": "String"
                },
                "skillsMatch": {
                    "technical": ["String", ...],
                    "soft": ["String", ...],
                    "gaps": ["String", ...]
                },
                "concerns": ["String", ...],
                "recommendation": {
                    "rating": "High/Medium/Low",
                    "summary": "String"
                },
                "interviewFocus": ["String", ...]
            }
            
            RESUME TEXT:
            ${resumeText}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown code blocks if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Gemini AI Error:", error);
        return generateMockAnalysis(resumeText); // Fallback on error
    }
};

// Mock Data logic generator (Fallback)
const generateMockAnalysis = (resumeText) => {
    return {
        candidateName: "Candidate (Mock)",
        roleDetected: "Developer",
        overallScore: 75,
        overview: "Analysis failed or API Key missing. Please check backend console.",
        keyStrengths: ["Mock Strength 1", "Mock Strength 2"],
        experienceAssessment: {
            yearsOfExperience: 3,
            progression: "Normal",
            relevance: "Medium",
            summary: "Mock summary due to missing API key."
        },
        skillsMatch: {
            technical: ["Html", "Css", "React"],
            soft: ["Communication"],
            gaps: ["Real Analysis"]
        },
        concerns: ["API Key missing or Analysis Failed"],
        recommendation: {
            rating: "Medium",
            summary: "Please add GEMINI_API_KEY to .env file in Backend folder."
        },
        interviewFocus: ["System Setup"]
    };
};

// --- ROUTES ---

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend is running' });
});

// Login Endpoint
app.post('/api/login', async (req, res) => {
    const { email, password, name } = req.body;

    // Auto-register (upsert) for this simple demo
    try {
        let user = await db.get('SELECT * FROM users WHERE email = ?', email);
        if (!user) {
            const result = await db.run(
                'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
                name || 'User', email, password
            );
            user = await db.get('SELECT * FROM users WHERE id = ?', result.lastID);
        }

        return res.json({
            success: true,
            user: user,
            token: 'mock-jwt-token-' + user.id
        });
    } catch (e) {
        console.error("Login DB Error:", e);
        // Fallback for demo if DB fails
        return res.json({
            success: true,
            user: { id: 1, name: name || 'User', email },
            token: 'mock-jwt-fallback'
        });
    }
});

// Analysis History
app.get('/api/history', async (req, res) => {
    try {
        // Just get all for now (in real app, filter by user_id from token)
        const rows = await db.all('SELECT * FROM analyses ORDER BY created_at DESC LIMIT 20');
        const history = rows.map(r => ({
            ...r,
            analysis: JSON.parse(r.analysis_json)
        }));
        res.json({ success: true, data: history });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

// Analysis Endpoint (Text)
app.post('/api/analyze', async (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ success: false, message: 'No text provided' });

    const analysis = await analyzeWithGemini(text);

    // Save to DB
    try {
        await db.run(
            `INSERT INTO analyses (user_id, candidate_name, role_detected, overall_score, analysis_json) 
             VALUES (?, ?, ?, ?, ?)`,
            1, // Hardcoded User ID 1 for demo
            analysis.candidateName || 'Unknown',
            analysis.roleDetected || 'Unknown',
            analysis.overallScore || 0,
            JSON.stringify(analysis)
        );
    } catch (e) {
        console.error("Failed to save analysis:", e);
    }

    res.json({ success: true, data: analysis });
});

// Analysis Endpoint (File Upload)
app.post('/api/analyze-upload', upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        let resumeText = "";
        const ext = path.extname(req.file.originalname).toLowerCase();

        console.log(`Processing file: ${req.file.originalname} (${req.file.mimetype})`);
        console.log("File info:", JSON.stringify(req.file));

        if (req.file.mimetype === 'application/pdf' || ext === '.pdf') {
            console.log("Attempting PDF parse...");
            resumeText = await extractTextFromPDF(req.file.path);
            console.log("PDF parse successful, text length:", resumeText.length);
        } else if (ext === '.docx') {
            console.log("Attempting DOCX parse...");
            resumeText = await extractTextFromDocx(req.file.path);
            console.log("DOCX parse successful.");
        } else if (ext === '.txt' || ext === '.md') {
            resumeText = fs.readFileSync(req.file.path, 'utf8');
        } else {
            // Fallback/Attempt to read as text for unknown types
            console.warn("Unknown file type, attempting text read:", ext);
            resumeText = fs.readFileSync(req.file.path, 'utf8');
        }

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        const analysis = await analyzeWithGemini(resumeText);

        // Save to DB
        try {
            await db.run(
                `INSERT INTO analyses (user_id, candidate_name, role_detected, overall_score, analysis_json) 
                 VALUES (?, ?, ?, ?, ?)`,
                1, // Hardcoded User ID 1 for demo
                analysis.candidateName || 'Unknown',
                analysis.roleDetected || 'Unknown',
                analysis.overallScore || 0,
                JSON.stringify(analysis)
            );
        } catch (e) {
            console.error("Failed to save analysis:", e);
        }

        res.json({ success: true, data: analysis });

    } catch (error) {
        console.error("FULL UPLOAD ERROR DETAILS:", error);
        fs.writeFileSync('error.txt', 'UPLOAD FAIL: ' + (error.stack || error.message));
        res.status(500).json({ success: false, message: 'File processing failed: ' + error.message });
    }
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

// Export for Vercel serverless environment
export default app;

require('dotenv').config("./.env");
const express = require('express');
const connectDB = require('./Utils/db');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const { createWorker } = require('tesseract.js');
const PDFParser = require('pdf2json');
const { GoogleGenerativeAI } = require('@google/generative-ai');  // ✅ Replaced groq-sdk
const extractTextOcr = require('./OcrTextExtra');
const processWithGemini = require('./Gemini.js');  // ✅ Renamed from Groq.js
const upload = require('./uploads/multer.js');
// In index.js
const uploadRouter = require('./Routes/UploadRouter.js');  // Add .js


const app = express();
const PORT = process.env.PORT || 3001;

// ---------------- MIDDLEWARE (CORRECT ORDER) ----------------
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static('uploads'));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// ---------------- ROUTES ----------------
app.use('/api', uploadRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ---------------- DATABASE & GEMINI ----------------
connectDB().catch(console.error);

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);  // ✅ Changed from GROQ_API_KEY

// ---------------- EXPRESS V5 404 HANDLER LAST ----------------
app.use((req, res, next) => {
  console.log(`❌ 404: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Route not found', 
    url: req.originalUrl,
    method: req.method 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📤 Upload: POST http://localhost:${PORT}/api/process-pdf`);
  console.log(`🔍 Health: GET http://localhost:${PORT}/health`);
  console.log(`🔑 GOOGLE_GEMINI_API_KEY: ${process.env.GOOGLE_GEMINI_API_KEY ? '✅ Set' : '❌ Missing'}`);
});

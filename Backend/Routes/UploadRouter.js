const express = require('express');
const router = express.Router();
const upload = require('../uploads/multer.js');
const extractPdfTextNative = require('../pdfExtraction');
const extractTextOcr = require('../OcrTextExtra');
const processWithGroq = require('../Gemini.js');
const fs = require('fs').promises;

// ✅ CORRECT route path - mounts at /api/process-pdf
router.post('/process-pdf', [
  upload.single('pdf'),
  // File validation
  (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF uploaded', accounts: [] });
    }
    if (req.file.mimetype !== 'application/pdf' || req.file.size > 10 * 1024 * 1024) {
      return res.status(400).json({ error: 'Invalid PDF (max 10MB)' });
    }
    next();
  }
], async (req, res) => {
  const tempFile = req.file.path;
  
  try {
    console.log('📥 Processing:', req.file.originalname, `(${req.file.size} bytes)`);
    
    // 1. Native PDF extraction first
    let ocrText = await extractPdfTextNative(tempFile);
    
    // 2. OCR fallback
    if (!ocrText || ocrText.trim().length < 100) {
      console.log('📄 Native failed, using OCR...');
      ocrText = await extractTextOcr(tempFile);
    }

    console.log('🧠 Text extracted:', ocrText.length, 'chars');

    // 3. Groq AI parsing
    const accounts = await processWithGroq(ocrText, req.file.originalname);

    res.json({ 
      success: true,
      accounts, 
      textLength: ocrText.length,
      filename: req.file.originalname 
    });
    
  } catch (err) {
    console.error('❌ Processing error:', err);
    res.status(500).json({ error: 'Processing failed', accounts: [] });
  } finally {
    // Async cleanup
    (async () => {
      try {
        if (tempFile && await fs.access(tempFile).then(() => true).catch(() => false)) {
          await fs.unlink(tempFile);
        }
      } catch (e) {
        console.warn('⚠️ Cleanup failed:', e.message);
      }
    })();
  }
});

module.exports = router;

const express = require('express');
const upload = require('../uploads/multer.js');
const extractPdfTextNative = require('../pdfExtraction.js');
const extractTextOcr = require('../OcrTextExtra.js');
const processWithGroq = require('../Gemini.js');
const fs = require('fs').promises;

const router = express.Router();

router.post('/process-pdf', [
  upload.single('pdf'),
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
    
    let ocrText = await extractPdfTextNative(tempFile);
    
    if (!ocrText || ocrText.trim().length < 100) {
      console.log('📄 Native failed, using OCR...');
      ocrText = await extractTextOcr(tempFile);
    }

    console.log('🧠 Text extracted:', ocrText.length, 'chars');

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

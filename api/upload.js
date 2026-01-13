// api/upload.js - Uses YOUR Gemini.js directly
require('dotenv').config();
import fs from 'fs/promises';
import formidable from 'formidable';
import extractTextOcr from '../OcrTextExtra.js';
import processWithGemini from '../Gemini.js';  // YOUR EXACT FILE

export const config = {
  api: { bodyParser: false }
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const form = formidable({
      uploadDir: './tmp',
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024
    });

    const { files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });

    const pdfFile = files.pdf?.[0] || files.pdf;
    if (!pdfFile) {
      return res.status(400).json({ error: 'No PDF uploaded', accounts: [] });
    }

    const tempFile = pdfFile.filepath;
    const originalName = pdfFile.originalFilename;

    if (!pdfFile.mimetype?.includes('application/pdf') || pdfFile.size > 10 * 1024 * 1024) {
      await fs.unlink(tempFile).catch(() => {});
      return res.status(400).json({ error: 'Invalid PDF (max 10MB)' });
    }

    console.log(`📥 Processing: ${originalName} (${pdfFile.size} bytes)`);

    // YOUR OCR (keep your existing OcrTextExtra.js)
    const ocrText = await extractTextOcr(tempFile);
    
    console.log('🧠 Text extracted:', ocrText.length, 'chars');

    // YOUR EXACT GEMINI FUNCTION - NO CHANGES NEEDED!
    const accounts = await processWithGemini(ocrText, originalName);

    await fs.unlink(tempFile).catch(console.warn);

    res.json({ 
      success: true,
      accounts, 
      textLength: ocrText.length,
      filename: originalName 
    });

  } catch (err) {
    console.error('❌ Processing error:', err);
    res.status(500).json({ error: 'Processing failed', accounts: [] });
  }
}
 
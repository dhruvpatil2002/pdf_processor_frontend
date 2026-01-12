const { createCanvas, loadImage, ImageData } = require('canvas');
const { createWorker } = require('tesseract.js');
const fs = require('fs');
const path = require('path');

async function pdfToImage(pdfPath, pageNum = 0) {
  // Simple PDF-to-image using canvas (first page only for speed)
  // In production, use pdf-poppler or Ghostscript
  console.log('📄 Converting PDF page to image...');
  return new Promise((resolve) => {
    // For now, return empty - install pdf2pic below
    resolve(null);
  });
}

async function extractTextOcr(filePath) {
  try {
    console.log('🖼️ OCR processing...');
    
    // Convert PDF page 1 to PNG (requires pdf2pic)
    const imagePath = filePath.replace('.pdf', '_ocr.png');
    
    // Skip conversion for now - direct Tesseract works better with preprocessing
    const worker = await createWorker(['eng', 'hin'], 1, {
      logger: m => console.log(m)
    });
    
    // Try direct PDF recognition (Tesseract v5 supports it)
    const { data: { text } } = await worker.recognize(filePath);
    await worker.terminate();
    
    console.log(`✅ OCR extracted: ${text.length} chars`);
    return text.trim();
    
  } catch (error) {
    console.error('❌ OCR failed:', error.message);
    return '';
  }
}

module.exports = extractTextOcr;

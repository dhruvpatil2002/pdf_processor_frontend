const PDFParser = require('pdf2json');
const fs = require('fs');  // ✅ Core fs

async function extractPdfTextNative(filePath) {
  return new Promise((resolve) => {
    if (!fs.existsSync(filePath)) {
      return resolve('');
    }

    const pdfParser = new PDFParser(null, 1);
    
    pdfParser.on('pdfParser_dataError', () => resolve(''));
    pdfParser.on('pdfParser_dataReady', (pdfData) => {
      const text = pdfParser.getRawTextContent();
      console.log(`✅ Native extracted: ${text.length} chars`);
      resolve(text);
    });
    
    pdfParser.loadPDF(filePath);
  });
}

module.exports = extractPdfTextNative;

const { GoogleGenerativeAI } = require('@google/generative-ai');

async function processWithGemini(text, filename) {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
  
 
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  
  const prompt = `Return ONLY valid JSON array - NO other text!

Extract bank statement data:
[
  {
    "bankName": "HDFC Bank",
    "accountHolder": "John Doe",
    "accountNumber": "XXXXXXX1234", 
    "accountType": "Savings",
    "startDate": "01-Jan-2026",
    "endDate": "31-Jan-2026",
    "openingBalance": "50000.00",
    "closingBalance": "75000.00",
    "transactions": [
      {
        "date": "05-Jan-26",
        "description": "Salary Credit", 
        "debit": null,
        "credit": "25000.00",
        "balance": "75000.00"
      }
    ]
  }
]

PDF text (${filename}):
"""${text.substring(0, 25000)}"""`;

  try {
    const result = await model.generateContent(prompt);
    let response = result.response.text();

    // ✅ EXTRACT JSON from response
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      response = jsonMatch[0];
    }
    
    response = response
      .replace(/```json|```/g, '')
      .replace(/```/g, '')
      .trim();
    
    console.log('🤖 Raw Gemini response preview:', response.substring(0, 100));
    
    // ✅ PARSE & VALIDATE
    let accounts = [];
    try {
      accounts = JSON.parse(response);
    } catch (parseError) {
      console.error('❌ Parse failed:', parseError.message);
      return [{
        bankName: "Parsing Failed",
        accountHolder: filename,
        accountNumber: "N/A", 
        accountType: "Unknown",
        startDate: "N/A",
        endDate: "N/A", 
        openingBalance: "0.00",
        closingBalance: "0.00",
        transactions: []
      }];
    }
    
    if (!Array.isArray(accounts)) {
      accounts = [accounts];
    }
    
    accounts = accounts.map(acc => ({
      bankName: acc.bankName || "Unknown Bank",
      accountHolder: acc.accountHolder || "N/A",
      accountNumber: acc.accountNumber || "N/A",
      accountType: acc.accountType || "Unknown", 
      startDate: acc.startDate || "N/A",
      endDate: acc.endDate || "N/A",
      openingBalance: acc.openingBalance || "0.00",
      closingBalance: acc.closingBalance || "0.00",
      transactions: Array.isArray(acc.transactions) ? acc.transactions : []
    }));
    
    console.log(`✅ Gemini parsed ${accounts.length} accounts successfully`);
    return accounts;
    
  } catch (error) {
    console.error('❌ Gemini API error:', error.message);
    return [{
      bankName: "API Error", 
      accountHolder: filename,
      accountNumber: "N/A",
      transactions: []
    }];
  }
}

module.exports = processWithGemini;

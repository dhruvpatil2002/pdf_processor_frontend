// api/upload.js - MUST be lowercase filename
export default async function handler(req, res) {
  // Vercel edge runtime expects this exact format
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method POST only' });
  }

  try {
    if (!req.headers['content-type']?.includes('multipart/form-data')) {
      return res.status(400).json({ error: 'PDF file required' });
    }

    // Simulate file processing (Vercel can't access real files easily)
    const mockAccounts = [
      {
        bankName: "HDFC Bank",
        accountHolder: "John Doe", 
        accountNumber: "****5678",
        accountType: "Savings",
        startDate: "01 Jan 2026",
        endDate: "31 Jan 2026", 
        openingBalance: "25,000",
        closingBalance: "28,450",
        transactions: [
          { date: "02 Jan", description: "Salary", debit: null, credit: "50,000", balance: "75,000" },
          { date: "05 Jan", description: "ATM", debit: "5,000", credit: null, balance: "70,000" }
        ]
      }
    ];

    return res.status(200).json({
      accounts: mockAccounts,
      pdfUrl: "https://example.com/sample.pdf"
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}

// api/upload.js
export default async function handler(req, res) {
  console.log('API HIT:', req.method, new Date().toISOString());
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: `Method ${req.method} not allowed, use POST` });
  }

  try {
    // Log form data
    console.log('Content-Type:', req.headers['content-type']);
    
    const mockAccounts = [{
      bankName: "HDFC Bank",
      accountHolder: "John Doe",
      accountNumber: "1234 **** 5678",
      accountType: "Savings",
      startDate: "01 Jan 2026",
      endDate: "31 Jan 2026",
      openingBalance: "25,000.00",
      closingBalance: "28,450.75",
      transactions: [
        { date: "02 Jan", description: "Salary Credit", debit: null, credit: "50,000.00", balance: "75,000.00" },
        { date: "05 Jan", description: "ATM Withdrawal", debit: "5,000.00", credit: null, balance: "70,000.00" }
      ]
    }];

    res.status(200).json({
      accounts: mockAccounts,
      pdfUrl: "https://example.com/sample.pdf"
    });

  } catch (error) {
    console.error('API ERROR:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
}

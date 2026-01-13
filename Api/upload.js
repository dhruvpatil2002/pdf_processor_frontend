// api/upload.js - Vercel Serverless API Route
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('pdf');
    
    if (!file || file.type !== 'application/pdf') {
      return res.status(400).json({ error: 'Please upload a valid PDF file' });
    }

    // Simulate PDF processing (replace with your actual OCR/PDF parsing logic)
    const mockAccounts = [
      {
        bankName: "HDFC Bank",
        accountHolder: "John Doe",
        accountNumber: "1234 **** 5678",
        accountType: "Savings Account",
        startDate: "01 Jan 2026",
        endDate: "31 Jan 2026",
        openingBalance: "25,000.00",
        closingBalance: "28,450.75",
        transactions: [
          { date: "02 Jan", description: "Salary Credit - XYZ Corp", debit: "-", credit: "50,000.00", balance: "75,000.00" },
          { date: "05 Jan", description: "ATM Withdrawal - ABC Mall", debit: "5,000.00", credit: "-", balance: "70,000.00" },
          { date: "10 Jan", description: "Amazon.in Online Shopping", debit: "2,549.25", credit: "-", balance: "67,450.75" },
          { date: "15 Jan", description: "Utility Bill Payment", debit: "1,200.00", credit: "-", balance: "66,250.75" }
        ]
      },
      {
        bankName: "ICICI Bank",
        accountHolder: "John Doe",
        accountNumber: "9876 **** 5432", 
        accountType: "Current Account",
        startDate: "01 Jan 2026",
        endDate: "31 Jan 2026",
        openingBalance: "1,50,000.00",
        closingBalance: "1,72,350.00",
        transactions: [
          { date: "03 Jan", description: "Client Payment Received", debit: "-", credit: "35,000.00", balance: "1,85,000.00" },
          { date: "12 Jan", description: "Office Rent Payment", debit: "18,650.00", credit: "-", balance: "1,66,350.00" }
        ]
      }
    ];

    // Return PDF filename as URL (in production, upload to Vercel Blob/S3)
    const pdfFilename = file.name;
    const pdfUrl = `https://pdf-processor-frontend.vercel.app/${pdfFilename}`;

    res.status(200).json({
      accounts: mockAccounts,
      pdfUrl: pdfUrl
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to process PDF' });
  }
}

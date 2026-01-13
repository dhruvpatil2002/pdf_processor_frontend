// api/upload.js - Place in ROOT api/ folder (same level as package.json)
export default async function handler(req, res) {
  console.log("API HIT:", req.method);
  
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST required" });
  }

  const mockAccounts = [{
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
  }];

  res.status(200).json({
    accounts: mockAccounts,
    pdfUrl: "https://example.com/sample.pdf"
  });
}

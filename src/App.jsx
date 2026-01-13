import React, { useState } from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import axios from "axios";

export default function App() {
  const [file, setFile] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pdfUrl, setPdfUrl] = useState(""); // ✅ NEW: Store PDF URL

  const handleUpload = (e) => {
    setFile(e.target.files?.[0] || null);
    setError("");
    setPdfUrl(""); // Reset PDF URL
  };

  const processFile = async () => {
    if (!file) {
      setError("Please select a PDF file");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("pdf", file);

      // ✅ FIXED: Correct endpoints for both backends
      const url = process.env.NODE_ENV === 'production' 
        ? '/api/upload'  // Vercel
        : 'https://backend-seven-virid-49.vercel.app/api/upload';  // Express

      const response = await axios.post(url, formData);

      setAccounts(response.data.accounts || []);
      
      // ✅ NEW: Store PDF URL for viewing
      if (response.data.pdfUrl) {
        setPdfUrl(response.data.pdfUrl);
      }
      
    } catch (err) {
      setError(err.response?.data?.error || "Failed to process PDF");
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setFile(null);
    setAccounts([]);
    setPdfUrl("");
    setError("");
  };

  return (
    <div style={{ minHeight: "100vh", padding: 24, background: "#f5f6f8" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <h2 style={{ marginBottom: 20 }}>Bank Statement Parser</h2>

        <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
          {/* Left Panel - Upload */}
          <div style={{ width: "35%", background: "#fff", padding: 24, borderRadius: 8 }}>
            <h3>Upload Bank Statement</h3>
            
            {/* ✅ NEW: PDF Preview Section */}
            {pdfUrl && (
              <div style={{ marginBottom: 16 }}>
                <h4>📄 Original PDF:</h4>
                <iframe
                  src={`${pdfUrl}#view=FitH`}
                  style={{ 
                    width: "100%", 
                    height: 300, 
                    border: "1px solid #ddd", 
                    borderRadius: 4 
                  }}
                  title="Uploaded PDF"
                />
              </div>
            )}

            <div
              style={{
                border: "2px dashed #ccc",
                borderRadius: 8,
                padding: 24,
                textAlign: "center",
                background: "#fafafa",
              }}
            >
              <input
                id="pdfUpload"
                type="file"
                accept=".pdf"
                onChange={handleUpload}
                style={{ display: "none" }}
              />
              <label
                htmlFor="pdfUpload"
                style={{
                  display: "inline-block",
                  padding: "10px 18px",
                  background: "#e5e7eb",
                  color: "#111827",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                Choose File
              </label>
              <div style={{ marginTop: 10, fontSize: 13, color: "#777" }}>
                Only PDF files are supported
              </div>
            </div>

            {file && (
              <div
                style={{
                  marginTop: 16,
                  padding: 12,
                  background: "#f0f4ff",
                  borderRadius: 6,
                  fontSize: 14,
                }}
              >
                <strong>Selected:</strong> {file.name} ({(file.size/1024/1024).toFixed(1)} MB)
              </div>
            )}

            {error && <div style={{ marginTop: 12, color: "red", fontSize: 14 }}>{error}</div>}

            <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
              <button
                onClick={processFile}
                disabled={loading || !file}
                style={{
                  padding: "10px 18px",
                  background: "#2563eb",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 6,
                  cursor: loading || !file ? "not-allowed" : "pointer",
                  opacity: loading || !file ? 0.6 : 1,
                }}
              >
                {loading ? "Processing…" : "Process PDF"}
              </button>
              <button
                onClick={clearAll}
                disabled={loading}
                style={{
                  padding: "10px 18px",
                  background: "#e5e7eb",
                  color: "#111827",
                  border: "none",
                  borderRadius: 6,
                }}
              >
                Clear
              </button>
            </div>
          </div>

          {/* Right Panel - Results */}
          <div style={{ width: "65%" }}>
            {accounts.length === 0 && !loading && (
              <div style={{ color: "#666", background: "#fff", padding: 24, borderRadius: 8 }}>
                Upload a PDF to extract bank accounts and transactions
              </div>
            )}

            {accounts.length > 0 && (
              <Tabs>
                <TabList>
                  {accounts.map((acc, i) => (
                    <Tab key={i}>{acc.bankName || `Account ${i + 1}`}</Tab>
                  ))}
                </TabList>

                {accounts.map((acc, i) => (
                  <TabPanel key={i}>
                    <div style={{ background: "#fff", padding: 20, borderRadius: 8 }}>
                      <h3>Account Details</h3>
                      <table style={{ width: "100%", marginBottom: 20 }}>
                        <tbody>
                          <tr><td>Account Holder</td><td>{acc.accountHolder}</td></tr>
                          <tr><td>Account Number</td><td>{acc.accountNumber}</td></tr>
                          <tr><td>Account Type</td><td>{acc.accountType}</td></tr>
                          <tr><td>Statement Period</td><td>{acc.startDate} - {acc.endDate}</td></tr>
                          <tr><td>Opening Balance</td><td>₹{acc.openingBalance}</td></tr>
                          <tr><td>Closing Balance</td><td>₹{acc.closingBalance}</td></tr>
                        </tbody>
                      </table>

                      <h3>Transactions</h3>
                      <table width="100%" border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ background: "#eee" }}>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Debit</th>
                            <th>Credit</th>
                            <th>Balance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {acc.transactions?.map((t, j) => (
                            <tr key={j}>
                              <td>{t.date}</td>
                              <td>{t.description || t.desc}</td>
                              <td style={{ color: 'red' }}>{t.debit || "-"}</td>
                              <td style={{ color: 'green' }}>{t.credit || "-"}</td>
                              <td>{t.balance}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </TabPanel>
                ))}
              </Tabs>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

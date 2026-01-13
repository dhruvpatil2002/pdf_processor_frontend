import React, { useState } from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import axios from "axios";

export default function App() {
  const [file, setFile] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // ✅ Always string
  const [pdfUrl, setPdfUrl] = useState("");

  const handleUpload = (e) => {
    setFile(e.target.files?.[0] || null);
    setError("");
    setPdfUrl("");
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

      // ✅ FIXED: Always relative path for Vercel
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30s timeout
      });

      setAccounts(response.data.accounts || []);
      if (response.data.pdfUrl) {
        setPdfUrl(response.data.pdfUrl);
      }
      
    } catch (err) {
      // ✅ FIXED: Safe error handling - prevents React error #31
      const errorMessage = err.response?.data?.error || 
                          err.message || 
                          "Failed to process PDF. Please try again.";
      setError(errorMessage);
      console.error('Upload error:', err.response || err);
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
            
            {/* PDF Preview */}
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
                Only PDF files are supported (max 10MB)
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
                <strong>Selected:</strong> {file.name} 
                <span style={{ float: 'right', color: '#666' }}>
                  {(file.size/1024/1024).toFixed(1)} MB
                </span>
              </div>
            )}

            {error && (
              <div style={{ 
                marginTop: 12, 
                padding: 12,
                background: "#fee",
                color: "#dc2626", 
                fontSize: 14,
                borderRadius: 6,
                border: "1px solid #fecaca"
              }}>
                {error}
              </div>
            )}

            <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
              <button
                onClick={processFile}
                disabled={loading || !file}
                style={{
                  padding: "10px 18px",
                  background: loading || !file ? "#9ca3af" : "#2563eb",
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
              <div style={{ 
                color: "#666", 
                background: "#fff", 
                padding: 24, 
                borderRadius: 8,
                minHeight: "400px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <div>
                  <div style={{ fontSize: 48, color: "#d1d5db", marginBottom: 16 }}>📊</div>
                  Upload a PDF to extract bank accounts and transactions
                </div>
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
                      <h3 style={{ marginBottom: 16, color: "#1f2937" }}>Account Details</h3>
                      <table style={{ width: "100%", marginBottom: 20, background: "#f9fafb" }}>
                        <tbody style={{ fontSize: 14 }}>
                          <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                            <td style={{ padding: "8px 0", fontWeight: 500, width: "40%" }}>Account Holder</td>
                            <td>{acc.accountHolder}</td>
                          </tr>
                          <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                            <td style={{ padding: "8px 0", fontWeight: 500 }}>Account Number</td>
                            <td>{acc.accountNumber}</td>
                          </tr>
                          <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                            <td style={{ padding: "8px 0", fontWeight: 500 }}>Account Type</td>
                            <td>{acc.accountType}</td>
                          </tr>
                          <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                            <td style={{ padding: "8px 0", fontWeight: 500 }}>Statement Period</td>
                            <td>{acc.startDate} - {acc.endDate}</td>
                          </tr>
                          <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                            <td style={{ padding: "8px 0", fontWeight: 500 }}>Opening Balance</td>
                            <td style={{ color: "#059669" }}>₹{acc.openingBalance}</td>
                          </tr>
                          <tr>
                            <td style={{ padding: "8px 0", fontWeight: 500 }}>Closing Balance</td>
                            <td style={{ color: "#059669", fontWeight: 600, fontSize: 16 }}>₹{acc.closingBalance}</td>
                          </tr>
                        </tbody>
                      </table>

                      <h3 style={{ marginBottom: 16, color: "#1f2937" }}>Transactions</h3>
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
                          <thead>
                            <tr style={{ background: "#f3f4f6" }}>
                              <th style={{ padding: "12px 8px", textAlign: "left", fontWeight: 600 }}>Date</th>
                              <th style={{ padding: "12px 8px", textAlign: "left", fontWeight: 600 }}>Description</th>
                              <th style={{ padding: "12px 8px", textAlign: "right", fontWeight: 600 }}>Debit</th>
                              <th style={{ padding: "12px 8px", textAlign: "right", fontWeight: 600 }}>Credit</th>
                              <th style={{ padding: "12px 8px", textAlign: "right", fontWeight: 600 }}>Balance</th>
                            </tr>
                          </thead>
                          <tbody>
                            {acc.transactions?.map((t, j) => (
                              <tr key={j} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                <td style={{ padding: "12px 8px" }}>{t.date}</td>
                                <td style={{ padding: "12px 8px" }}>{t.description}</td>
                                <td style={{ 
                                  padding: "12px 8px", 
                                  textAlign: "right", 
                                  color: t.debit ? "#dc2626" : "#9ca3af" 
                                }}>
                                  {t.debit || "-"}
                                </td>
                                <td style={{ 
                                  padding: "12px 8px", 
                                  textAlign: "right", 
                                  color: t.credit ? "#059669" : "#9ca3af" 
                                }}>
                                  {t.credit || "-"}
                                </td>
                                <td style={{ 
                                  padding: "12px 8px", 
                                  textAlign: "right", 
                                  fontWeight: 500 
                                }}>
                                  ₹{t.balance}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
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

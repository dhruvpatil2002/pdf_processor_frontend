import React, { useState } from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import axios from "axios";

export default function App() {
  const [file, setFile] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // ✅ Always STRING only
  const [pdfUrl, setPdfUrl] = useState("");

  const handleUpload = (e) => {
    setFile(e.target.files?.[0] || null);
    setError("");
    setPdfUrl("");
  };

  const processFile = async () => {
    if (!file) {
      setError("Please select a PDF file first");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("pdf", file);

      // ✅ FIXED: Use fetch instead of axios (more reliable on Vercel)
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      // ✅ FIXED: Check response status BEFORE json()
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server Error ${response.status}: ${errorText || 'Unknown error'}`);
      }

      const data = await response.json();
      
      // ✅ Safe data access
      setAccounts(Array.isArray(data.accounts) ? data.accounts : []);
      
      if (data.pdfUrl) {
        setPdfUrl(data.pdfUrl);
      }
      
    } catch (err) {
      // 🚨 CRITICAL FIX: Never render error OBJECT - always STRING
      const errorMessage = err.message || 
                          'Failed to process PDF. Please try again.';
      setError(errorMessage);
      console.error('Upload failed:', err);
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
        <h2 style={{ marginBottom: 20, color: "#1f2937" }}>Bank Statement Parser</h2>

        <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
          {/* Left Panel - Upload */}
          <div style={{ width: "35%", background: "#fff", padding: 24, borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <h3 style={{ marginBottom: 16, color: "#374151" }}>Upload Bank Statement</h3>
            
            {/* PDF Preview */}
            {pdfUrl && (
              <div style={{ marginBottom: 16 }}>
                <h4 style={{ marginBottom: 8 }}>📄 Original PDF:</h4>
                <iframe
                  src={`${pdfUrl}#view=FitH&toolbar=0`}
                  style={{ 
                    width: "100%", 
                    height: 300, 
                    border: "1px solid #d1d5db", 
                    borderRadius: 6 
                  }}
                  title="Uploaded PDF"
                />
              </div>
            )}

            {/* File Upload Area */}
            <div
              style={{
                border: "2px dashed #d1d5db",
                borderRadius: 8,
                padding: 24,
                textAlign: "center",
                background: "#fafbfc",
                transition: "all 0.2s",
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
                  padding: "12px 24px",
                  background: "#3b82f6",
                  color: "white",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                Choose PDF File
              </label>
              <div style={{ marginTop: 12, fontSize: 13, color: "#6b7280" }}>
                Only PDF files (max 10MB)
              </div>
            </div>

            {/* Selected File Info */}
            {file && (
              <div
                style={{
                  marginTop: 16,
                  padding: 12,
                  background: "#dbeafe",
                  borderRadius: 6,
                  fontSize: 14,
                }}
              >
                <strong>✅ Selected:</strong> {file.name} 
                <span style={{ float: 'right', color: '#1e40af' }}>
                  {(file.size/1024/1024).toFixed(1)} MB
                </span>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div style={{ 
                marginTop: 12, 
                padding: 12,
                background: "#fee2e2",
                color: "#dc2626", 
                fontSize: 14,
                borderRadius: 6,
                border: "1px solid #fecaca"
              }}>
                ❌ {error}
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
              <button
                onClick={processFile}
                disabled={loading || !file}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  background: (loading || !file) ? "#9ca3af" : "#3b82f6",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 6,
                  cursor: (loading || !file) ? "not-allowed" : "pointer",
                  fontWeight: 500,
                }}
              >
                {loading ? "⏳ Processing..." : "🚀 Process PDF"}
              </button>
              <button
                onClick={clearAll}
                disabled={loading}
                style={{
                  padding: "12px 16px",
                  background: "#f3f4f6",
                  color: "#374151",
                  border: "none",
                  borderRadius: 6,
                  fontWeight: 500,
                }}
              >
                🗑️ Clear
              </button>
            </div>
          </div>

          {/* Right Panel - Results */}
          <div style={{ width: "65%" }}>
            {accounts.length === 0 && !loading && (
              <div style={{ 
                color: "#6b7280", 
                background: "#fff", 
                padding: 40, 
                borderRadius: 8,
                minHeight: "400px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
              }}>
                <div style={{ fontSize: 64, marginBottom: 16, opacity: 0.3 }}>📊</div>
                <div style={{ textAlign: "center" }}>
                  <h3 style={{ color: "#374151", marginBottom: 8 }}>No Data Yet</h3>
                  <p>Upload a PDF bank statement to extract accounts and transactions</p>
                </div>
              </div>
            )}

            {loading && (
              <div style={{ 
                background: "#fff", 
                padding: 40, 
                borderRadius: 8,
                textAlign: "center",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
              }}>
                <div style={{ fontSize: 48, marginBottom: 16, color: "#3b82f6" }}>⏳</div>
                <h3>Processing PDF...</h3>
                <p>Extracting bank accounts and transactions</p>
              </div>
            )}

            {accounts.length > 0 && (
              <Tabs>
                <TabList>
                  {accounts.map((acc, i) => (
                    <Tab key={i} style={{ fontWeight: 500 }}>
                      {acc.bankName || `Account ${i + 1}`}
                    </Tab>
                  ))}
                </TabList>

                {accounts.map((acc, i) => (
                  <TabPanel key={i}>
                    <div style={{ background: "#fff", padding: 24, borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                      <h3 style={{ marginBottom: 20, color: "#1f2937" }}>💳 Account Details</h3>
                      
                      <div style={{ 
                        background: "#f8fafc", 
                        padding: 20, 
                        borderRadius: 8, 
                        marginBottom: 24 
                      }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                          <div><strong>Account Holder:</strong> {acc.accountHolder}</div>
                          <div><strong>Account Type:</strong> {acc.accountType}</div>
                          <div><strong>Account No:</strong> {acc.accountNumber}</div>
                          <div><strong>Period:</strong> {acc.startDate} - {acc.endDate}</div>
                          <div style={{ color: "#059669" }}><strong>Opening:</strong> ₹{acc.openingBalance}</div>
                          <div style={{ color: "#059669", fontSize: 18, fontWeight: 700 }}>
                            <strong>Closing:</strong> ₹{acc.closingBalance}
                          </div>
                        </div>
                      </div>

                      <h4 style={{ marginBottom: 16, color: "#374151" }}>📈 Transactions</h4>
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ 
                          width: "100%", 
                          borderCollapse: "collapse", 
                          minWidth: 600,
                          background: "white",
                          borderRadius: 8,
                          overflow: "hidden",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                        }}>
                          <thead>
                            <tr style={{ background: "#f8fafc" }}>
                              <th style={{ padding: "16px 12px", textAlign: "left", fontWeight: 600, borderBottom: "1px solid #e5e7eb" }}>Date</th>
                              <th style={{ padding: "16px 12px", textAlign: "left", fontWeight: 600, borderBottom: "1px solid #e5e7eb" }}>Description</th>
                              <th style={{ padding: "16px 12px", textAlign: "right", fontWeight: 600, borderBottom: "1px solid #e5e7eb" }}>Debit</th>
                              <th style={{ padding: "16px 12px", textAlign: "right", fontWeight: 600, borderBottom: "1px solid #e5e7eb" }}>Credit</th>
                              <th style={{ padding: "16px 12px", textAlign: "right", fontWeight: 600, borderBottom: "1px solid #e5e7eb" }}>Balance</th>
                            </tr>
                          </thead>
                          <tbody>
                            {acc.transactions?.map((t, j) => (
                              <tr key={j} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                <td style={{ padding: "16px 12px", fontWeight: 500 }}>{t.date}</td>
                                <td style={{ padding: "16px 12px" }}>{t.description}</td>
                                <td style={{ 
                                  padding: "16px 12px", 
                                  textAlign: "right", 
                                  color: t.debit ? "#dc2626" : "#9ca3af",
                                  fontWeight: t.debit ? 600 : "normal"
                                }}>
                                  {t.debit || "-"}
                                </td>
                                <td style={{ 
                                  padding: "16px 12px", 
                                  textAlign: "right", 
                                  color: t.credit ? "#059669" : "#9ca3af",
                                  fontWeight: t.credit ? 600 : "normal"
                                }}>
                                  {t.credit || "-"}
                                </td>
                                <td style={{ 
                                  padding: "16px 12px", 
                                  textAlign: "right", 
                                  fontWeight: 600,
                                  color: "#1f2937"
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

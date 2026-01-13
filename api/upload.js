export default async function handler(req, res) {
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Your PDF processing logic here
    const { pdfData } = req.body
    
    // Example response (replace with actual PDF processing)
    const result = {
      success: true,
      extractedText: "Sample extracted text from PDF",
      pages: 2
    }
    
    res.status(200).json(result)
  } catch (error) {
    res.status(500).json({ error: 'PDF processing failed', details: error.message })
  }
}

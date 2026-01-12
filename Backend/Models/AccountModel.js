const mongoose = require('mongoose');



const accountSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  bankName: { type: String, required: true },
  accountHolder: { type: String, required: true },
  accountNumber: { type: String, required: true },
  accountType: { type: String, default: 'Savings' },
  currency: { type: String, default: 'INR' },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  openingBalance: { type: Number, required: true },
  closingBalance: { type: Number, required: true },
  transactions: [transactionSchema],
  processedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Account', accountSchema);

const mongoose  = require('mongoose')

const purchaseSchema = new mongoose.Schema({
userEmail: { type: String, required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  total: Number,
  status: { type: String, default: 'paid' },
  reference: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
})

const Purchase = mongoose.model('Purchase', purchaseSchema)
module.exports = Purchase
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  customerName: String,
  gender: String,
  dressType: String,
  measurements: Object,
  status: { type: String, default: 'Pending' }
});

module.exports = mongoose.model('Order', orderSchema);

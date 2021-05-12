var mongoose = require('mongoose');

var TransactionSchema = new mongoose.Schema({
   id_compte: {
    type: String,
    unique: false,
    required: true,
    trim: true
  },
  montant: {
    type: Number,
    unique: false,
    required: true,
    trim: true
  },
  date_transaction: {
    type: Date,
    unique: false,
    required: true,
    trim: true
  },
  type_transaction: {
    type: String,
    unique: false,
    required: false,
    trim: true
  }
});

var Transaction = mongoose.model('Transaction', TransactionSchema);
module.exports = Transaction;


var mongoose = require('mongoose');

var TransactionSchema = new mongoose.Schema({
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
  },
  description: {
    type: String,
    unique: false,
    required: false,
    trim: true
  },
  id_compte_envoyeur: {
    type: String,
    unique: false,
    required: false,
    trim: true
  }
  ,
  id_compte_receveur: {
    type: String,
    unique: false,
    required: false,
    trim: true
  },
  solde: {
    type: Number,
    unique: false,
    required: false,
    trim: true
  }
});

var Transaction = mongoose.model('Transaction', TransactionSchema);
module.exports = Transaction;


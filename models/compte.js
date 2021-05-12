var mongoose = require('mongoose');

var CompteSchema = new mongoose.Schema({
   id_client: {
    type: String,
    unique: false,
    required: true,
    trim: true
  },
  type: {
    type: String,
    unique: false,
    required: true,
    trim: true
  },
  solde: {
    type: Number,
    unique: false,
    required: true,
    trim: true
  },
  date_limite: {
    type: Date,
    unique: false,
    required: false,
    trim: true
  }
});

var Compte = mongoose.model('Compte', CompteSchema);
module.exports = Compte;


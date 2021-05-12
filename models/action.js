var mongoose = require('mongoose');

var ActionSchema = new mongoose.Schema({
   id_client: {
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
  symbole: {
    type: String,
    unique: false,
    required: true,
    trim: true
  }
});

var Action = mongoose.model('Action', ActionSchema);
module.exports = Action;
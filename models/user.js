var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var UserSchema = new mongoose.Schema({
  nom: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  prenom: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  telephone: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  adresse: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  date_naissance: {
    type: Date,
    unique: true,
    required: true,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  
  mot_de_passe: {
    type: String,
    required: true,
  }
});

//authenticate input against database
UserSchema.statics.authenticate = function (email, mot_de_passe, callback) {
  User.findOne({ email: email })
    .exec(function (err, user) {
      if (err) {
        return callback(err)
      } else if (!user) {
        var err = new Error('User not found.');
        err.status = 401;
        return callback(err);
      }
      bcrypt.compare(mot_de_passe, user.mot_de_passe, function (err, result) {
        if (result === true) {
          return callback(null, user);
        } else {
          return callback();
        }
      })
    });
}

//hashing a password before saving it to the database
UserSchema.pre('save', function (next) {
  var user = this;
  bcrypt.hash(user.mot_de_passe, 10, function (err, hash) {
    if (err) {
      return next(err);
    }
    user.mot_de_passe = hash;
    next();
  })
});


var User = mongoose.model('Client', UserSchema);
module.exports = User;


var express = require('express');
var router = express.Router();
var User = require('../models/user');


// GET route for reading data
router.get('/', function (req, res, next) {
  res.sendFile('accueil.html', { root: './views/Pages' });
});

router.get('/login', function (req, res, next) {
  res.sendFile('login.html', { root: './views/Pages' });
});

router.get('/signup', function (req, res, next) {
  res.sendFile('signup.html', { root: './views/Pages' });
});

router.get('/sommaire', function (req, res, next) {
  res.sendFile('sommaire.html', { root: './views/Pages' });
});


//POST route for updating data
router.post('/', function (req, res, next) {
  // confirm that user typed same password twice
  if (req.body.mot_de_passe !== req.body.passwordConf) {
    var err = new Error('Passwords do not match.');
    err.status = 400;
    res.send("passwords dont match");
    return next(err);
  }

  if (
    req.body.nom &&
    req.body.prenom &&
    req.body.telephone &&
    req.body.adresse &&
    req.body.date_naissance&&
    req.body.email &&
    req.body.mot_de_passe &&
    req.body.passwordConf) {

    var userData = {
      nom: req.body.nom,
      prenom:req.body.prenom,
      telephone:req.body.telephone,
      adresse:req.body.adresse,
      date_naissance:req.body.date_naissance,
      email: req.body.email,
      mot_de_passe: req.body.mot_de_passe,
    }

    User.create(userData, function (error, user) {
      if (error) {
        return next(error);
      } else {
        req.session.userId = user._id;
        return res.redirect('/sommaire');
      }
    });

  } else if (req.body.logemail && req.body.logpassword) {
    User.authenticate(req.body.logemail, req.body.logpassword, function (error, user) {
      if (error || !user) {
        var err = new Error('Wrong email or password.');
        err.status = 401;
        return next(err);
      } else {
        req.session.userId = user._id;
        return res.redirect('/sommaire');
      }
    });
  } else {
    var err = new Error('All fields required.');
    err.status = 400;
    return next(err);
  }
})

// GET route after registering
router.get('/sommaire', function (req, res, next) {
  User.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        return next(error);
      } else {
        if (user === null) {
          var err = new Error('Not authorized! Go back!');
          err.status = 400;
          return next(err);
        } else {
          return res.send('<h1>Nom: </h1>' + user.nom + '<h2>Courriel: </h2>' + user.email + '<br><a type="button" href="/logout">Logout</a>')
        }
      }
    });
});

// GET for logout logout
router.get('/logout', function (req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

module.exports = router;
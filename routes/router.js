var express = require('express');
var router = express.Router();
var User = require('../models/user');
var connected = false;
var yahooFinance = require('yahoo-finance');

var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0');
var yyyy = today.getFullYear();

today = mm + '/' + dd + '/' + yyyy;

yahooFinance.historical({
  symbol: 'AAPL',
  from: today.toDateString,
  to: today.toDateString,
}, function (err, quotes) {
  console.log(quotes[0].close)
});

// GET route for reading data
router.get('/', function (req, res, next) {
  res.render('./Pages/accueil.ejs', {
    siteTitle: "KDD Finance",
    pageTitle: "Accueil",
    items: connected
  });
});

router.get('/apropos', function (req, res, next) {
  res.render('./Pages/apropos.ejs', {
    siteTitle: "KDD Finance",
    pageTitle: "À propos",
    items: connected
  });
});

router.get('/pageLogin', function (req, res, next) {
  res.render('./Pages/login.ejs', {
    siteTitle: "KDD Finance",
    pageTitle: "Se connecter",
    items: connected
  });
});

router.get('/pageSignup', function (req, res, next) {
  res.render('./Pages/signup.ejs', {
    siteTitle: "KDD Finance",
    pageTitle: "S'inscrire",
    items: connected
  });
});

router.get('/login', function (req, res, next) {
  if (connected) {
    return res.redirect('/sommaireNew');
  } else {
    return res.redirect('/pageLogin');
  }
});

router.get('/signup', function (req, res, next) {
  if (connected) {
    return res.redirect('/sommaireNew');
  } else {
    return res.redirect('/pageSignup');
  }
});

router.get('/transactions', function (req, res, next) {
  res.render('./Pages/transactions.ejs', {
    siteTitle: "KDD Finance",
    pageTitle: "Transactions",
    items: "ok"
  });
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
      id_client: 2
    }

    User.create(userData, function (error, user) {
      if (error) {
        return next(error);
      } else {
        req.session.userId = user._id;
        return res.redirect('/sommaireNew');
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
        return res.redirect('/sommaireNew');
      }
    });
  } else {
    var err = new Error('All fields required.');
    err.status = 400;
    return next(err);
  }
})

// GET route after registering
router.get('/sommaireNew', function (req, res, next) {
  User.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        return next(error);
      } else {
        if (user === null) {
          return res.redirect('/login');
        } else {
          connected = true;
          res.render('./Pages/sommaireNew.ejs', {
            siteTitle: "KDD Finance",
            pageTitle: "sommaireNew",
            items: user
          });
          //return res.send('<h1>Nom: </h1>' + user.nom + '<h2>Courriel: </h2>' + user.email + '<br><a type="button" href="/logout">Logout</a>')
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
        connected = false;
        return res.redirect('/');
      }
    });
  }
});


module.exports = router;
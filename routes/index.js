var express = require('express');
var router = express.Router();
var { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

// Page accueil
router.get('/', forwardAuthenticated, (req, res) => res.render('./Pages/signup.ejs', {
    siteTitle: "KDD Finance",
    pageTitle: "S'inscrire",
    items: "ok"
}));

// Page sommaire
router.get('/sommaire', ensureAuthenticated, (req, res) => res.render('./Pages/sommaire.ejs', {
    siteTitle: "KDD Finance",
    pageTitle: "Sommaire",
    items: "ok",
    user: req.user
  })
);

module.exports = router;
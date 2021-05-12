var express = require("express");
var router = express.Router();
var User = require("../models/client");
var Compte = require("../models/compte");
var Transaction = require("../models/transaction");
var yahooStockPrices = require("yahoo-stock-prices");
var connected = false;

async function trouverPrix(symbole) {
  const data = await yahooStockPrices.getCurrentData(symbole);
  return data.price; //{ currency: 'USD', price: 132.05 }
}

async function trouverDevises() {
  const [eurcad, eurusd, usdcad, usdeur] = await Promise.all([
    trouverPrix("EURCAD=X").then((data) => {
      return data;
    }),
    trouverPrix("EURUSD=X").then((data) => {
      return data;
    }),
    trouverPrix("CAD=X").then((data) => {
      return data;
    }),
    trouverPrix("EUR=X").then((data) => {
      return data;
    }),
  ]);
  const devises = {
    eurcad,
    eurusd,
    usdcad,
    usdeur,
  };
  return devises;
}

var today = new Date();
var dd = String(today.getDate()).padStart(2, "0");
var mm = String(today.getMonth() + 1).padStart(2, "0");
var yyyy = today.getFullYear();

today = mm + "/" + dd + "/" + yyyy;

// GET route for reading data
router.get("/", function (req, res, next) {
  res.render("./Pages/accueil.ejs", {
    siteTitle: "KDD Finance",
    pageTitle: "Accueil",
    items: connected,
  });
});

router.get("/apropos", function (req, res, next) {
  res.render("./Pages/apropos.ejs", {
    siteTitle: "KDD Finance",
    pageTitle: "À propos",
    items: connected,
  });
});

router.get("/pageLogin", function (req, res, next) {
  res.render("./Pages/login.ejs", {
    siteTitle: "KDD Finance",
    pageTitle: "Se connecter",
    items: connected,
  });
});

router.get("/pageSignup", function (req, res, next) {
  res.render("./Pages/signup.ejs", {
    siteTitle: "KDD Finance",
    pageTitle: "S'inscrire",
    items: connected,
  });
});

router.get("/login", function (req, res, next) {
  if (connected) {
    return res.redirect("/sommaire");
  } else {
    return res.redirect("/pageLogin");
  }
});

router.get("/signup", function (req, res, next) {
  if (connected) {
    return res.redirect("/sommaire");
  } else {
    return res.redirect("/pageSignup");
  }
});

router.get("/transactions", function (req, res, next) {
  res.render("./Pages/transactions.ejs", {
    siteTitle: "KDD Finance",
    pageTitle: "Transactions",
    items: "ok",
  });
});

//POST route for updating data
router.post("/", function (req, res, next) {
  // confirm that user typed same password twice
  if (req.body.mot_de_passe !== req.body.passwordConf) {
    var err = new Error("Passwords do not match.");
    err.status = 400;
    res.send("passwords dont match");
    return next(err);
  }

  if (
    req.body.nom &&
    req.body.prenom &&
    req.body.telephone &&
    req.body.adresse &&
    req.body.date_naissance &&
    req.body.email &&
    req.body.mot_de_passe &&
    req.body.passwordConf
  ) {
    var userData = {
      nom: req.body.nom,
      prenom: req.body.prenom,
      telephone: req.body.telephone,
      adresse: req.body.adresse,
      date_naissance: req.body.date_naissance,
      email: req.body.email,
      mot_de_passe: req.body.mot_de_passe,
    };

    User.create(userData, function (error, user) {
      if (error) {
        return next(error);
      } else {
        req.session.userId = user._id;
        var typeComptes = ["Débit", "Épargnes", "Crédit", "Actions"];
        typeComptes.forEach((typeCompte) => {
          var compteData = {
            id_client: user._id,
            type: typeCompte,
            solde: 100000,
          };
          Compte.create(compteData, function (error, compte) {
            if (error) {
              return next(error);
            } else {
            }
          });
        });

        return res.redirect("/sommaire");
      }
    });
  } else if (req.body.logemail && req.body.logpassword) {
    User.authenticate(
      req.body.logemail,
      req.body.logpassword,
      function (error, user) {
        if (error || !user) {
          var err = new Error("Wrong email or password.");
          err.status = 401;
          return next(err);
        } else {
          req.session.userId = user._id;
          return res.redirect("/sommaire");
        }
      }
    );
  } else {
    var err = new Error("All fields required.");
    err.status = 400;
    return next(err);
  }
});

// GET route after registering
router.get("/sommaire", function (req, res, next) {
  User.findById(req.session.userId).exec(function (error, user) {
    if (error) {
      return next(error);
    } else {
      if (user === null) {
        return res.redirect("/login");
      } else {
        Compte.find({ id_client: req.session.userId }).exec(function (
          error,
          comptes
        ) {
          if (error) {
            return next(error);
          } else {
            trouverDevises().then((devises) => {
              data = { user, devises, comptes };
              connected = true;
              res.render("./Pages/sommaire.ejs", {
                siteTitle: "KDD Finance",
                pageTitle: "sommaire",
                items: data,
              });
            });
          }
        });
      }
    }
  });
});

// GET for logout
router.get("/logout", function (req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        connected = false;
        return res.redirect("/");
      }
    });
  }
});

// GET for transfererClient
router.post("/transfererClient", function (req, res, next) {
  Compte.find({ id_client: req.session.userId, type: "Débit" }).exec(function (
    error,
    compte
  ) {
    if (error) {
      console.log("error");
      return next(error);
    } else {
      console.log(compte[0].solde);
      console.log(req.body.montant)
      if (compte[0].solde < req.body.montant) {
        console.log("ici");
        var err = new Error("Montant insuffisant.");
        err.status = 406;
        return next(err);
      } else {
        console.log("ici2");
        User.find({ email: req.body.destinataire }).exec(function (
          error,
          client
        ) {
          if (error) {
            var err = new Error("Courriel non existant.");
            err.status = 407;
            return next(err);
          } else {
            Compte.find({ id_client: client._id, type: "Débit" }).exec(function (
              error,
              compte2
            ) {
              if (error) {
                return next(error);
              } else {
                console.log(compte.solde);
                console.log(compte2.solde);
                Compte.findOneAndUpdate({ id_client:client._id, type: "Débit" }, { solde:5 })
                Compte.findOneAndUpdate({ _id:compte2._id, type: "Débit" }, { solde:5 })
              }
            });
          }
        });
      }
    }
  });
  // req.session.userId;
  // req.body.destinataire;
  // req.body.montant;
});

module.exports = router;

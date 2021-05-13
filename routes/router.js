var express = require("express");
var router = express.Router();
var User = require("../models/client");
var Compte = require("../models/compte");
var Transaction = require("../models/transaction");
var Action = require("../models/action");
var yahooStockPrices = require("yahoo-stock-prices");
var connected = false;
var userGlobal = null;
var comptesGlobal = null;

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
    items: userGlobal,
  });
});

router.get("/apropos", function (req, res, next) {  
  res.render("./Pages/apropos.ejs", {
    siteTitle: "KDD Finance",
    pageTitle: "À propos",
    items: userGlobal,
  });
});

router.get("/actions", function (req, res, next) {  
  res.render("./Pages/actions.ejs", {
    siteTitle: "KDD Finance",
    pageTitle: "Actions",
    items: {nom:userGlobal.nom, prenom:userGlobal.prenom, comptes:comptesGlobal},
  });
});

router.get("/pageLogin", function (req, res, next) {  
  res.render("./Pages/login.ejs", {
    siteTitle: "KDD Finance",
    pageTitle: "Se connecter",
    items: userGlobal,
  });
});

router.get("/pageSignup", function (req, res, next) {  
  res.render("./Pages/signup.ejs", {
    siteTitle: "KDD Finance",
    pageTitle: "S'inscrire",
    items: userGlobal,
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
    items: userGlobal,
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
      date_creation: today
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

        var symboleActions = ["AAPL", "TSLA", "MFST", "GME", "AMZN", "FB", "AMD", "INTC", "NFLX"];
        symboleActions.forEach((symboleAction) => {
          var actionData = {
            id_client: user._id,
            symbole: symboleAction,
            montant: 0,
          };
          Action.create(actionData, function (error, action) {
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
        userGlobal = user;
        Compte.find({ id_client: req.session.userId }).exec(function (error, comptes) {
          if (error) {
            return next(error);
          } else {
            var comptesSolde = [];
            for (let i = 0; i < comptes.length; i++) {
              if (comptes[i].type == "Débit") {
                comptesSolde[0] = comptes[i].solde
              }
              if (comptes[i].type == "Épargnes") {
                comptesSolde[1] = comptes[i].solde
              }
              if (comptes[i].type == "Crédit") {
                comptesSolde[2] = comptes[i].solde
              }
              if (comptes[i].type == "Actions") {
                comptesSolde[3] = comptes[i].solde
              }
            }
            
            trouverDevises().then((devises) => {
              data = { devises, comptes:comptesSolde, prenom:user.prenom, nom:user.nom};
              connected = true;
              comptesGlobal = comptesSolde;
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
        userGlobal = null;
        return res.redirect("/");
      }
    });
  }
});

// POST for transfererClient
router.post("/transfererClient", function (req, res, next) {
  Compte.find({ id_client: req.session.userId, type: "Débit" }).exec(function (
    error,
    compte
  ) {
    if (error) {
      return next(error);
    } else {
      if (compte[0].solde < req.body.montant) {
        var err = new Error("Montant insuffisant.");
        err.status = 406;
        return next(err);
      } else {
        User.find({ email: req.body.destinataire }).exec(function (
          error,
          client
        ) {
          if (client == "") {
            var err = new Error("Courriel non existant.");
            err.status = 406;
            return next(err);
          } else {
            Compte.find({ id_client: client[0]._id, type: "Débit" }).exec(function (
              error,
              compte2
            ) {
              if (error) {
                return next(error);
              } else {
                var myquery1 = {_id:compte[0]._id, type: "Débit"}
                var newvalues1 = { $set: {solde:(compte[0].solde - req.body.montant * 1)} };
                var myquery2 = {_id:compte2[0]._id, type: "Débit"}
                var newvalues2 = { $set: {solde:(compte2[0].solde + req.body.montant * 1)} };
                Compte.findOneAndUpdate( myquery1, newvalues1 , function(err, res) {
                  if (err) throw err;
                });
                Compte.findOneAndUpdate( myquery2, newvalues2, function(err, res) {
                  if (err) throw err;
                });

                var transactionData1 = {
                  montant:(req.body.montant *-1),
                  date_transaction:today,
                  type_transaction:"TCLI",
                  description:"Transfert au client " + req.body.destinataire,
                  id_compte_envoyeur:compte[0]._id,
                  id_compte_receveur:compte2[0]._id,
                  solde:compte[0].solde
                };
                var transactionData2 = {
                  montant:req.body.montant,
                  date_transaction:today,
                  type_transaction:"TCLI",
                  description:"Transfert du client " + userGlobal.email,
                  id_compte_envoyeur:compte[0]._id,
                  id_compte_receveur:compte2[0]._id,
                  solde:compte2[0].solde
                };
                Transaction.create(transactionData1, function (error, compte) {
                  if (error) throw error;
                });
                Transaction.create(transactionData2, function (error, compte) {
                  if (error) throw error;
                });
                return res.redirect("/sommaire");
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

// POST for transfererCompte
router.post("/transfererCompte", function (req, res, next) {
  Compte.find({ id_client:req.session.userId, type:req.body.typeCompte1 }).exec(function (
    error,
    compte
  ) {
    if (error) {
      return next(error);
    } else {
      if (compte[0].solde < req.body.montantTransfert) {
        var err = new Error("Montant insuffisant.");
        err.status = 406;
        return next(err);
      } else {
        Compte.find({ id_client:req.session.userId, type:req.body.typeCompte2 }).exec(function (
          error,
          compte2
        ) {
          if (error) {
            return next(error);
          } else {
            var myquery1 = {id_client:req.session.userId, type:req.body.typeCompte1}
            var newvalues1 = { $set: {solde:(compte[0].solde - req.body.montantTransfert * 1)} };
            var myquery2 = {id_client:req.session.userId, type:req.body.typeCompte2}
            var newvalues2 = { $set: {solde:(compte2[0].solde + req.body.montantTransfert * 1)} };
            Compte.findOneAndUpdate( myquery1, newvalues1 , function(err, res) {
              if (err) throw err;
            });
            Compte.findOneAndUpdate( myquery2, newvalues2, function(err, res) {
              if (err) throw err;
            });
            var transactionData1 = {
              montant:(req.body.montantTransfert *-1),
              date_transaction:today,
              type_transaction:"TCMP",
              description:"Transfert au compte " + compte2[0].type,
              id_compte_envoyeur:compte[0]._id,
              id_compte_receveur:compte2[0]._id,
              solde:compte[0].solde
            };
            var transactionData2 = {
              montant:req.body.montantTransfert,
              date_transaction:today,
              type_transaction:"TCMP",
              description:"Transfert du compte " + compte[0].type,
              id_compte_envoyeur:compte[0]._id,
              id_compte_receveur:compte2[0]._id,
              solde:compte2[0].solde
            };
            Transaction.create(transactionData1, function (error, compte) {
              if (error) throw error;
            });
            Transaction.create(transactionData2, function (error, compte) {
              if (error) throw error;
            });

            return res.redirect("/sommaire");
          }
        });
      }
    }
  });
  // req.session.userId;
  // req.body.typeCompte1;
  // req.body.typeCompte2;
  // req.body.montantTransfert;
});

// POST for acheterAction
router.post("/acheterAction", function (req, res, next) {
  Compte.find({ id_client:req.session.userId, type:"Actions" }).exec(function (
    error,
    compte
  ) {
    if (error) {
      return next(error);
    } else {
      if (compte[0].solde < req.body.montant) {
        var err = new Error("Montant insuffisant.");
        err.status = 406;
        return next(err);
      } else {
        Action.find({ id_client:req.session.userId, symbole:req.body.symboleAction }).exec(function (
          error,
          action
        ) {
          if (error) {
            return next(error);
          } else {
            const prixAction = async () => {
              await trouverPrix(req.body.symboleAction).then((data) => { return data; })
            }
            const montantAction = (montant / prixAction).toFixed(2);

            var myquery1 = {id_client:req.session.userId, type:"Actions"}
            var newvalues1 = { $set: {solde:(compte[0].solde - req.body.montant * 1)} };
            var myquery2 = {id_client:req.session.userId, symbole:req.body.symboleAction}
            var newvalues2 = { $set: {montant:(compte2[0].solde + req.body.montantTransfert * 1)} };
            Compte.findOneAndUpdate( myquery1, newvalues1 , function(err, res) {
              if (err) throw err;
            });
            Compte.findOneAndUpdate( myquery2, newvalues2, function(err, res) {
              if (err) throw err;
            });
            var transactionData1 = {
              montant:(req.body.montantTransfert *-1),
              date_transaction:today,
              type_transaction:"TCMP",
              description:"Transfert au compte " + compte2[0].type,
              id_compte_envoyeur:compte[0]._id,
              id_compte_receveur:compte2[0]._id,
              solde:compte[0].solde
            };
            var transactionData2 = {
              montant:req.body.montantTransfert,
              date_transaction:today,
              type_transaction:"TCMP",
              description:"Transfert du compte " + compte[0].type,
              id_compte_envoyeur:compte[0]._id,
              id_compte_receveur:compte2[0]._id,
              solde:compte2[0].solde
            };
            Transaction.create(transactionData1, function (error, compte) {
              if (error) throw error;
            });
            Transaction.create(transactionData2, function (error, compte) {
              if (error) throw error;
            });

            return res.redirect("/sommaire");
          }
        });
      }
    }
  });
  // req.session.userId;
  // req.body.symboleAction;
  // req.body.montant;
});

module.exports = router;

/*
*
* Import all node modules
*/


var express = require('express');
var http = require('http');
var mysql = require('mysql');
var app = express();
var bodyParser = require('body-parser');

/*
app.use((req, res, next) => { 
    console.log('Requête reçue !'); 
    next(); // passer au prochain middleware 
}); 
app.use((req, res, next) => { 
    res.json({ message: 'Votre requête a bien été reçue !' }); 
    next(); 
}); 
app.use((req, res, next) => { 
    console.log('Réponse envoyée avec succès !'); 
    next();
}); 
Module.exports=app;
*/

/*
* parse all form data
*/
app.use(bodyParser.urlencoded({ extended: true }));
module.exports = app;


/*
*used for formatting dates
*/
var dateFormat = require('dateformat');
var now = new Date();


app.use(express.static(__dirname + "/views"));
/*
* view engine template parsing (ejs types)
*/

app.set('view engine', 'ejs');

/**
* import all related Javascript and css files to inject in our app
*/

app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/js', express.static(__dirname + '/node_modules/tether/dist/js'));
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));

/**
* connection à la BD
*/

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "mybd"
});

/**
* Global site title and base url
*/

const siteTitle = "KDD Projet_1";
const baseURL = "http://localhost:4000/"

/*
* Envoyer le contenu au client
* get the client list
*/
app.get('/', function (req, res) {



    con.query("SELECT * FROM bd_kdd ORDER BY DATE_DE_CREATION DESC", function (err, result) {
        res.render('Pages/signup', {
            siteTitle: siteTitle,
            pageTitle: "Client list",
            items: result
        });
    });

}); /* fin de app.get(....)*/
/*
app.get('/', function (req, res) {
    con.query("SELECT * FROM client ORDER BY DATE_DE_CREATION DESC", function (err, result) {
        res.render('Pages/signup.ejs', {
            siteTitle: siteTitle,
            pageTitle: "Créer un compte",
            items: result
        });
    });

});
*/

app.post('/', function (req, res) {

    /* get the record base on ID
    */
    var query = "INSERT INTO client ( client_nom,client_prenom,date_de_naissance,telephone,adresse,code_postale,client_courriel,mot_de_passe,date_de_creation) VALUES (";
    query += " '" + req.body.client_nom + "',";
    query += " '" + req.body.client_prenom + "',";
    query += " '" + dateFormat(req.body.date_de_naissance,"yyyy-mm-dd") + "',";
    query += " '" + req.body.telephone + "',";
    query += " '" + req.body.adresse + "',";
    query += " '" + req.body.code_postale + "',";
    query += " '" + req.body.client_courriel + "',";
    query += " '" + req.body.mot_de_passe + "',";
    query += " '" + dateFormat(req.body.date_de_creation, "yyyy-mm-dd") + "')";

    con.query(query, function (err, result) {
        if (err) throw err;
        res.redirect(baseURL);
    });
});


var server = app.listen(4000, function () {
    console.log("serveur fonctionne sur 4000... ! ");
    
});



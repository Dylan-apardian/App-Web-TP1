/*
*
* Import all node modules
*/


var express = require('express');
var http = require ('http');
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
app.use(bodyParser.urlencoded({ extended: true}));
module.exports = app;


/*
*used for formatting dates
*/
var dateFormat = require('dateformat');
var now = new Date();


/*
* view engine template parsing (ejs types)
*/

app.set('view engine','ejs');

/**
* import all related Javascript and css files to inject in our app
*/

app.use('/js',express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/js',express.static(__dirname + '/node_modules/tether/dist/js'));
app.use('/js',express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/css',express.static(__dirname + '/node_modules/bootstrap/dist/css'));

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
	* get the event list
    */
app.get('/',function (req,res) {    
	
 /*
get the event list with select from table 
*/
/*	
** verifier la connexion à la BD : Afficher les events dans la table items sur la console
con.connect(function(err) {
    if (err) throw err;
con.query("SELECT * FROM e_events ", function (err, result){
    if (err) throw err;
    console.log('lol');
    console.log(result);
});

});
*/
/*
res.render('pages/index',{
    siteTitle : siteTitle,
    pageTitle : "Event list",
    items : ''
});

/*
get the event list with select from table 
*/
	
	con.query("SELECT * FROM bd_kdd ORDER BY e_start_date DESC", function (err, result){
		res.render('pages/index',{
			siteTitle : siteTitle,
			pageTitle : "Event list",
			items : result
		});
	});

}); /* fin de app.get(....)*/

var server = app.listen(4000, function(){ 
    console.log("serveur fonctionne sur 4000... ! "); 
});


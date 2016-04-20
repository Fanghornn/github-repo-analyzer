(function(){

	"use strict";

	var express = require('express'),
		app,
		path = require('path'),
		bodyParser = require('body-parser');

	function startServer(){

		app = express();
		app.disable('x-powered-by'); 
		app.use(require('compression')());
		app.use(bodyParser.json());
		app.use(bodyParser.urlencoded({extended: true}));

		//For static resources
		app.use(express.static(path.join(__dirname + '/../', 'static')));

		// For angular directives
		app.use(express.static(path.join(__dirname + '/../', 'views')));

		setAppRoutes();

		app.listen('1337');

		console.log('\n Listening now on port 1337, you can now visit localhost:1337 \n');

	}

	function setAppRoutes(){

		//The main route (regex matches / and /index.html)
		app.get('(/|/index.html)', function(req, res){
			res.sendFile('index.html', {root:'./views'});
		});

		//Handles any other routes accessed by any http method
		app.all('*', function(req, res){
			//Send 404 error
			res.sendFile('404.html', {root:'./views'});
		});

	}

	exports.start = function(){
		startServer();
	};

})();
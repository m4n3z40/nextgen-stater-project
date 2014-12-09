//Install JSX runtime compilation
require('node-jsx').install({extension: '.jsx'});

//Dependencies
var express = require('express');
var app = require('./app');
var React = require('react');

//Creates the App instance on the server
var serverApp = express();

//Configuring the jade view engine at the view directory
serverApp.set('views', './views');
serverApp.set('view engine', 'jade');
serverApp.engine('jade', require('jade').__express);

//Configures the assets static server at the /assets endpoint
serverApp.use('/assets', express.static('assets'));

//Gets the app config
var appConfig = app.config('app');

//Gets the component that will render the page content
var Main = app.getMainComponent();

//Sets the default route handler
serverApp.get('/', function(req, res) {
    res.render('layouts/default', {
        language: appConfig.defaultLanguage,
        pageTitle: appConfig.siteTitle,
        mainComponent: React.renderToString(Main({world:'React'}))
    });
});

//Gets the server config
var serverConfig = app.config('server');

//Start the server
var server = serverApp.listen(serverConfig.port, serverConfig.address, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Started server at http://%s:%s', host, port);
});
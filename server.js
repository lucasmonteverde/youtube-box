'use strict';

var express = require('express'),
	logger = require('morgan'),
	//cookieParser = require('cookie-parser'),
	//bodyParser = require('body-parser'),
	compression = require('compression'),
	session = require('express-session'),
	RedisStore = require('connect-redis')(session),
	hbs = require('express-handlebars'),
	db = require('./app/config/db'),
	cache = require('./app/config/cache'),
	passport = require('./app/config/passport'),
	cron = require('./app/config/cron'),
	fs = require('fs'),
	app = express();

app.engine('html', hbs({
	defaultLayout: 'main', 
	extname: '.html', 
	layoutsDir: 'app/views/templates',
	partialsDir: 'app/views/partials',
	helpers: require('./app/config/helpers')
}));

app.set('views', 'app/views');
app.set('view engine', 'html');

app.use(logger('dev'));
app.use(compression());
app.use(express.static('dist'));

//app.use(cookieParser());
//app.use(bodyParser.urlencoded({ extended: true }));
//app.use(bodyParser.json());

app.use(session({
	secret: 'youtube-box',
	store: new RedisStore({client: cache}),
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next) {
	res.locals.user = req.user;
	res.locals.path = req.path;
	
	next();
});

fs.readdirSync('./app/controllers').forEach(function (controller) {
	app.use('/' + controller.replace('.js', '').replace('index', ''), require('./app/controllers/' + controller));
});

app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

app.use(function(err, req, res, next) {
	res.status( err.status || 500 );
	
	var response = {
		layout: false,
		message: err.message,
		error: app.get('env') !== 'production' ? err : {}
	};
	
	res.format({
		html: function(){
			res.render(err.status === 404 ? '404' : 'error', response);
		},
		json: function(){
			res.json( response );
		}
	});
});

app.listen( process.env.PORT || 3000 );

module.exports = app;
'use strict';

var express = require('express'),
	logger = require('morgan'),
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser'),
	compression = require('compression'),
	helmet = require('helmet'),
	hbs = require('express-handlebars'),
	session = require('express-session'),
	RedisStore = require('connect-redis')(session),
	cache = require('config/cache'),
	passport = require('config/passport'),
	fs = require('fs'),
	app = express();
	
require('config/db');

var rollbar = require('rollbar').init({
	accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
	handleUncaughtExceptions: true,
	codeVersion: require('./package.json').version
});

app.engine('html', hbs({
	defaultLayout: 'main',
	extname: '.html',
	layoutsDir: 'app/views/templates',
	partialsDir: 'app/views/partials',
	helpers: require('./app/config/helpers')
}));

app.set('views', 'app/views');
app.set('view engine', 'html');

logger.format('prod', ':method :url :status - :response-time ms ":referrer" ":user-agent"');
app.use(logger(app.get('env') === 'production' ? 'prod' : 'dev'));

app.use(helmet());
app.use(compression());
app.use(express.static('dist'));

app.use(bodyParser.urlencoded({ extended: true }));
//app.use(bodyParser.json());

app.use(cookieParser());
app.use(session({
	secret: 'youtube-box',
	store: new RedisStore({client: cache}),
	resave: false,
	saveUninitialized: false,
	cookie: {
		maxAge: 2592000000, //30 days
		httpOnly: true,
		secure: 'auto'
	}
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next) {
	res.locals.user = req.user;
	res.locals.path = req.path;
	
	next();
});

fs.readdirSync('./app/controllers').forEach(function (ctrl) {
	app.use('/' + ctrl.replace(/\.js|index/g, ''), require('controllers/' + ctrl));
});

app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

 /*jshint unused:false*/
app.use(function(err, req, res, next) {
	
	if ( ! err.status || err.status >= 500 ) {
		console.error( 'App Error', err.message, err.stack );
		rollbar.handleError(err, req);
	}
	
	var response = {
		status: false,
		message: err.message,
		error: app.get('env') !== 'production' ? err : {}
	};
	
	res.status( err.status || 500 ).format({
		html: function(){
			response.layout = false;
			res.render(err.status === 404 ? '404' : 'error', response);
		},
		json: function(){
			res.json( response );
		}
	});
});

app.listen( process.env.PORT || 3000 );

module.exports = app;
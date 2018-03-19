const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database');
const compression = require('compression');
const cp = require("child_process");
const MongoStore = require('connect-mongo')(session);

const APP_PORT = 3000;

    mongoose.connect(config.database);
    let db = mongoose.connection;

// Check connection
    db.once('open', function () {
        console.log('Connected to MongoDB');
    });

// Check for DB errors
    db.on('error', function (err) {
        console.log(err);
    });

// Init App
    const app = express();

// Bring in Models

// Load View Engine
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'jade');

// Use compression
    app.use(compression());
// Body Parser Middleware
// parse application/x-www-form-urlencoded
    app.use(bodyParser.urlencoded({extended: false}));
// parse application/json
    app.use(bodyParser.json());

// Set Public Folder
    app.use(express.static(path.join(__dirname, 'public')));


// Express Session Middleware
    app.use(session({
        secret: 'qwerty123',
        store: new MongoStore({ mongooseConnection: mongoose.connection }),
        resave: true,
        saveUninitialized: true
    }));

// Express Messages Middleware
    app.use(require('connect-flash')());
    app.use(function (req, res, next) {
        res.locals.messages = require('express-messages')(req, res);
        next();
    });

// Express Validator Middleware
    app.use(expressValidator({
        errorFormatter: function (param, msg, value) {
            let namespace = param.split('.')
                , root = namespace.shift()
                , formParam = root;

            while (namespace.length) {
                formParam += '[' + namespace.shift() + ']';
            }
            return {
                param: formParam,
                msg: msg,
                value: value
            };
        }
    }));

// Passport Config
    require('./config/passport')(passport);
// Passport Middleware
    app.use(passport.initialize());
    app.use(passport.session());

// Route Files
    let index = require('./routes/index');
    let posts = require('./routes/posts');
    let tcnews = require('./routes/tcnews');
    let users = require('./routes/users');
    let strategies = require('./routes/strategies');
    let botconfigs = require('./routes/botconfigs');
    let analyzes = require('./routes/analyzes');
    let cryptonews = require('./routes/cryptonews');
    let tradenews = require('./routes/tradenews');

    app.use('/', index);
    app.use('/posts', posts);
    app.use('/tcnews', tcnews);
    app.use('/users', users);
    app.use('/strategies', strategies);
    app.use('/botconfigs', botconfigs);
    app.use('/analyzes', analyzes);
    app.use('/cryptonews', cryptonews);
    app.use('/tradenews', tradenews);

    app.listen(APP_PORT, function () {
        console.log('Server started on port ' + APP_PORT + '...');
    });


    // let child = cp.fork(`${__dirname}/components/newsparser.js`);

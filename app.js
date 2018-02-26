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

const cluster = require('cluster');

if (cluster.isMaster) {

    let child = cp.fork(`${__dirname}/components/newsparser.js`);

    // Count the machine's CPUs
    let cpuCount = require('os').cpus().length;

    // Create a worker for each CPU
    for (let i = 0; i < cpuCount; i += 1) {
        cluster.fork();
    }

// Code to run if we're in a worker process
} else {

    mongoose.connect(config.database);
    let db = mongoose.connection;

// Check connection
    db.once('open', function () {
        console.log('Worker ' + cluster.worker.id + ': Connected to MongoDB');
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
    let users = require('./routes/users');
    let strategies = require('./routes/strategies');
    let botconfigs = require('./routes/botconfigs');
    let analyzes = require('./routes/analyzes');

    app.use('/', index);
    app.use('/posts', posts);
    app.use('/users', users);
    app.use('/strategies', strategies);
    app.use('/botconfigs', botconfigs);
    app.use('/analyzes', analyzes);

// Start Server
    app.listen(3000, function () {
        console.log('Worker ' + cluster.worker.id + ': Server started on port 3000...');
    });
}

cluster.on('exit', function (worker) {

    // Replace the dead worker
    console.log('Worker %d died :(', worker.id);
    cluster.fork();

});

// let child = cp.fork(`${__dirname}/components/newsparser.js`);

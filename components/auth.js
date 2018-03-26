let Order = require('../models/order');

// Access Control
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash('danger', 'Please login');
        res.redirect('/users/login');
    }
}

function ensureManager(req, res, next) {
    if (req.isAuthenticated() && req.user.status > 2) {
        return next();
    } else {
        res.render('error', {
            message: 'Not Authorized',
            error: {status: 'Code: 403', stack: 'You do not have permissions to view this page.'}
        });
    }
}

function ensureSubscriber(req, res, next) {
    if (req.isAuthenticated() && req.user.status > 1) {
        return next();
    } else {
        res.render('error', {
            message: 'Not Authorized',
            error: {status: 'Code: 403', stack: 'You do not have permissions to view this page.'}
        });
    }
}

function ensureAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.status === 4) {
        return next();
    } else {
        res.render('error', {
            message: 'Not Authorized',
            error: {status: 'Code: 403', stack: 'You do not have permissions to view this page.'}
        });
    }
}

function payedResource(req, res, next) {

    if (req.isAuthenticated()) {
        if (req.user.status > 2) {
            return next();
        }
        Order.findOne({user_id: req.user._id, cfg_id : req.params.id}).exec(function (err, doc) {
            if (!err && doc.payed !== false && doc.payed !== undefined) {
                return next();
            }  else if (!err && doc.send_payment === false && doc.payed === false) {
                req.flash('warning', 'You already request this config. Please pay in invoice.');
                res.redirect('/orders/invoice/' + doc._id);
            } else {
                res.render('error', {
                    message: 'Restricted resource',
                    error: {status: 'Code: 402', stack: 'Please wait while we check the payment.'}
                });
            }
        });
    } else {
        res.render('error', {
            message: 'Not Authorized',
            error: {status: 'Code: 403', stack: 'You do not have permissions to view this page.'}
        });
    }
}

module.exports = {
    ensureAuthenticated: ensureAuthenticated,
    ensureManager: ensureManager,
    ensureSubscriber: ensureSubscriber,
    ensureAdmin: ensureAdmin,
    payedResource: payedResource
};
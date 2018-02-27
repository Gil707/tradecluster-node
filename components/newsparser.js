const rp = require('request-promise');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
const config = require('../config/database');


mongoose.connect(config.database);
let db = mongoose.connection;

// Check connection
// db.once('open', function () {
//     console.log('Parses connected to MongoDB');
// });

// Check for DB errors
db.on('error', function (err) {
    console.log(err);
});

let News = require('../models/news');

function parseCoindesk() {
    let options = {
        uri: 'https://www.coindesk.com/',
        transform: function (body) {
            return cheerio.load(body);
        }
    };

    rp(options)
        .then(function ($) {
            let block = $('#content').children().first();

            let news = new News();

            news.title = block.find('a.fade').text();
            news.img = block.find('img.wp-post-image').attr('data-cfsrc');
            news.link = block.find('a.standard-format-icon').attr('href');
            news.preview = block.find('p').last().text();
            news.time = block.find('p').first().text();
            news.resource = 'coindesk.com';


            News.find({title: news.title}, function (err, docs) {
                if (err) {
                    return console.log(err);
                } else {
                    if (docs.length) {
                        console.log(new Date() + ': News from coindesk.com is latest');
                    } else {
                        news.save(function (err) {
                            if (err) {
                                return console.log(err);
                            } else {
                                console.log(new Date() + ': News "' + news.title + '" from coindesk.com added');
                            }
                        });
                    }
                }
            });


        })
        .catch(function (err) {
            console.log(err)
        });
}

function parseCryptopotato() {
    let options = {
        uri: 'https://cryptopotato.com/crypto-news/',
        transform: function (body) {
            return cheerio.load(body);
        }
    };

    rp(options)
        .then(function ($) {
            let block = $('#list-items').children().first();

            let news = new News();

            news.title = block.find('a.image-link').attr('title');
            news.img = block.find('img.media-object').attr('src');
            news.link = block.find('a.image-link').attr('href');
            news.preview = block.find('div.entry-excerpt > p').text();
            news.time = block.find('span.entry-date > a').text() + ' ' + block.find('span.entry-time').text() + ' | ' + block.find('span.entry-user > a').text();
            news.resource = 'cryptopotato.com';

            News.find({title: news.title}, function (err, docs) {
                if (err) {
                    return console.log(err);
                } else {
                    if (docs.length) {
                        console.log(new Date() + ': News from cryptopotato.com is latest');
                    } else {
                        news.save(function (err) {
                            if (err) {
                                return console.log(err);
                            } else {
                                console.log(new Date() + ': News "' + news.title + '" from cryptopotato.com added');
                            }
                        });
                    }
                }
            });


        })
        .catch(function (err) {
            console.log(err)
        });
}

// parseCoindesk();
// parseCryptopotato();

setInterval(function () {
    parseCoindesk();
    parseCryptopotato();
}, 30000);
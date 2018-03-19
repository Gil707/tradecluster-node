const rp = require('request-promise');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
const config = require('../config/database');

let zeroEq = {
    eq: 0
};


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

let CryptoNews = require('../models/cryptonews');
let TradeNews = require('../models/tradenews');

function parseZerohedge() {
    let options = {
        uri: 'https://www.zerohedge.com/',
        transform: function (body) {
            return cheerio.load(body);
        }
    };

    rp(options)
        .then(function ($) {
            let block = $('#block-zerohedge-content').find('div.view-content').children().eq(zeroEq.eq);

            let tradenews = new TradeNews();

            tradenews.title = block.find('h2.teaser-title').find('a').text().trim();
            tradenews.img = options.uri + block.find('div.teaser-image').find('img').attr('src');
            tradenews.link = options.uri + block.find('h2.teaser-title').find('a').attr('href');
            tradenews.preview = block.find('div.teaser-text > div').find('p').text();
            tradenews.time = block.find('footer.teaser-details > ul.node__extras').find('li.extras__created').text().trim() + ' GMT';
            tradenews.resource = 'zerohedge.com';


            TradeNews.find({title: tradenews.title}, function (err, docs) {
                if (err) {
                    return console.log(err);
                } else {
                    if (docs.length) {
                        console.log(new Date() + ': TradeNews from zerohedge.com is latest');
                        if (zeroEq.eq === 0) {
                            zeroEq.eq++;
                            parseZerohedge();
                        } else zeroEq.eq = 0;
                    } else {
                        tradenews.save(function (err) {
                            if (err) {
                                return console.log(err);
                            } else {
                                console.log(new Date() + ': TradeNews "' + tradenews.title + '" from zerohedge.com added');
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

            let cryptonews = new CryptoNews();

            cryptonews.title = block.find('div.post-info').find('a.fade').text();
            cryptonews.img = block.find('img.wp-post-image').attr('data-cfsrc');
            cryptonews.link = block.find('a.fade').attr('href');
            cryptonews.preview = block.find('p').last().text();
            cryptonews.time = block.find('p').first().text();
            cryptonews.resource = 'coindesk.com';


            CryptoNews.find({title: cryptonews.title}, function (err, docs) {
                if (err) {
                    return console.log(err);
                } else {
                    if (docs.length) {
                        console.log(new Date() + ': CryptoNews from coindesk.com is latest');
                    } else {
                        cryptonews.save(function (err) {
                            if (err) {
                                return console.log(err);
                            } else {
                                console.log(new Date() + ': CryptoNews "' + cryptonews.title + '" from coindesk.com added');
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

            let cryptonews = new CryptoNews();

            cryptonews.title = block.find('a.image-link').attr('title');
            cryptonews.img = block.find('img.media-object').attr('src');
            cryptonews.link = block.find('a.image-link').attr('href');
            cryptonews.preview = block.find('div.entry-excerpt > p').text();
            cryptonews.time = block.find('span.entry-date > a').text() + ' ' + block.find('span.entry-time').text() + ' | ' + block.find('span.entry-user > a').text();
            cryptonews.resource = 'cryptopotato.com';

            CryptoNews.find({title: cryptonews.title}, function (err, docs) {
                if (err) {
                    return console.log(err);
                } else {
                    if (docs.length) {
                        console.log(new Date() + ': CryptoNews from cryptopotato.com is latest');
                    } else {
                        cryptonews.save(function (err) {
                            if (err) {
                                return console.log(err);
                            } else {
                                console.log(new Date() + ': CryptoNews "' + cryptonews.title + '" from cryptopotato.com added');
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
// parseZerohedge();

setInterval(function () {
    console.log('Start parsing...');
    parseCoindesk();
    parseCryptopotato();
    parseZerohedge();
}, 60000);
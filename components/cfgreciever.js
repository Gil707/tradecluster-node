let BotConfig = require('../models/botconfig');

function getBotConfig(id) {
    BotConfig.findById(id, function (err, botcfg) {
        if (!err) {
            return botcfg;
        }
    })
}

function getConfigData(key, id) {
    let obj = {};

    switch (key) {
        case 1:
            Object.assign(getBotConfig(id), obj);
            console.log(obj);
            break;
        default :
            obj = getBotConfig(id);
            break;
    }

    return obj;
}

module.exports = {
    getBotConfig: getBotConfig,
    getConfigData: getConfigData
};
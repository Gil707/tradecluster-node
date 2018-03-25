const mongoose = require('mongoose');
ObjectId = mongoose.Types.ObjectId;

// BotConfig Schema
let botconfigSchema = mongoose.Schema({
        author: {
            type: String,
            required: true
        },
        bot: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true,
            lowercase: true
        },
        version: {
            type: String,
            default: 1
        },
        market: {
            type: String,
            required: true
        },
        preview: {
            type: String,
            required: true
        },
        // Gekko, Haas
        body: {
            type: String,
            required: true
        },
        arclink: {
            type: String
        },
        cost: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    });



let BotConfig = module.exports = mongoose.model('BotConfig', botconfigSchema);
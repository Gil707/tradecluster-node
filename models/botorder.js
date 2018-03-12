const mongoose = require('mongoose');
let uniqueValidator = require('mongoose-unique-validator');

// BotOrder Schema
let botorderSchema = mongoose.Schema({
        user_id: {
            type: String,
            required: true
        },
        cfg_id: {
            type: String,
            required: true
        },
        addr: {
            type: String,
            required: true
        },
        payed: {
            type: Boolean,
            default: false
        },
        comment: {
            type: String
        }
    },
    {
        timestamps: true
    });

botorderSchema.index({user_id: 1, cfg_id: 1}, {unique: true});

botorderSchema.plugin(uniqueValidator);

let BotOrder = module.exports = mongoose.model('BotOrder', botorderSchema);
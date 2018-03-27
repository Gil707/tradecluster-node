const mongoose = require('mongoose');
let uniqueValidator = require('mongoose-unique-validator');
ObjectId = mongoose.Types.ObjectId;

// Subscribe Schema
let subscribeSchema = mongoose.Schema({
        user_id: {
            type: String,
            required: true
        },
        payed: {
            type: Boolean,
            default: false
        },
        interval: {
            type: Number,
            required: true
        },
        cost: {
            type: Number,
            required: true
        },
        currency: {
            // 1 - BTC, 2 - EUR, 3 - RUB
            type: Number,
            required: true
        },
        paid_till: {
            type: Date,
        },
        requisites: {
            type: String,
            required: true
        },
        receipt: {
            type: String
        },
        comment: {
            type: String
        }
    },
    {
        timestamps: true
    });

subscribeSchema.plugin(uniqueValidator);

let Subscribe = module.exports = mongoose.model('Subscribe', subscribeSchema);
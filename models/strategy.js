const mongoose = require('mongoose');

// Strategy Schema
let strategySchema = mongoose.Schema({
        author: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        type: {
            type: String,
            required: true
        },
        body: {
            type: String,
            required: true
        },
        cost: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    });

let Strategy = module.exports = mongoose.model('Strategy', strategySchema);
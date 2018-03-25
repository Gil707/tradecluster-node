const mongoose = require('mongoose');
let uniqueValidator = require('mongoose-unique-validator');

// Order Schema
let orderSchema = mongoose.Schema({
        user_id: {
            type: String,
            required: true
        },
        type: {
            // botcfg, strategy, analizes, post
            type: Number,
            required: true
        },
        cfg_id: {
            type: String,
            required: true
        },
        cfg_name: {
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
        balance: {
            type: Number,
            required: true
        },
        send_payment: {
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

orderSchema.index({user_id: 1, cfg_id: 1}, {unique: true});

orderSchema.plugin(uniqueValidator);

let Order = module.exports = mongoose.model('Order', orderSchema);
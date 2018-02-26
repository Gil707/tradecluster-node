const mongoose = require('mongoose');

// User schema

let UserSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    login: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    status: {
        // 1 - user, 2 - subscriber, 3 - manager, 4 - admin
        type: Number,
        default: 1,
        min: 1,
        max: 4
    },
    balance: {
        type: Number,
        default: 0
    },
    reputation: {
        type: Number,
        default: 0
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
});

let User = module.exports = mongoose.model('User', UserSchema);
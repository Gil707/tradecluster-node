const mongoose = require('mongoose');

// Comment Schema
let commentSchema = mongoose.Schema({
    author: {
        type: String,
        required: true
    },
    post_id: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    },
});

let Comment = module.exports = mongoose.model('Comment', commentSchema);
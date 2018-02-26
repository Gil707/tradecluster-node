const mongoose = require('mongoose');
ObjectId = mongoose.Types.ObjectId;

// Post Schema
let postSchema = mongoose.Schema({
    author: {
        type: String,
        required: true
    },
    caption: {
        type: String,
        required: true
    },
    preview: {
        type: String,
        required: true
    },
    text: {
        type: String
    },
    created_at: {
        type: Date,
        default: Date.now
    },
});

let Post = module.exports = mongoose.model('Post', postSchema);
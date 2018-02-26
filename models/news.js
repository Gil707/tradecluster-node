const mongoose = require('mongoose');
ObjectId = mongoose.Types.ObjectId;

// News Schema
let newsSchema = mongoose.Schema({
    title: {
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
    resource: {
        type: String,
        required: true
    },
    img: {
        type: String
    },
    link: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    },
});

let News = module.exports = mongoose.model('News', newsSchema);
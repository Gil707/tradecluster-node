const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
ObjectId = mongoose.Types.ObjectId;

mongoosePaginate.paginate.options = {
    lean: true,
    limit: 10
};

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
        subscribe_only: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    });

postSchema.plugin(mongoosePaginate);

let Post = module.exports = mongoose.model('Post', postSchema);
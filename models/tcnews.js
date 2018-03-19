const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
ObjectId = mongoose.Types.ObjectId;

mongoosePaginate.paginate.options = {
    lean: true,
    limit: 20
};

// TcNews Schema
let tcnewsSchema = mongoose.Schema({
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
        }
    },
    {
        timestamps: true
    });

tcnewsSchema.plugin(mongoosePaginate);

let TcNews = module.exports = mongoose.model('TcNews', tcnewsSchema);
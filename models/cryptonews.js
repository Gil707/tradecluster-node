const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
ObjectId = mongoose.Types.ObjectId;

mongoosePaginate.paginate.options = {
    lean: true,
    limit: 20
};

// CryptoNews Schema
let cryptonewsSchema = mongoose.Schema({
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
        }
    },
    {
        timestamps: true
    });

cryptonewsSchema.plugin(mongoosePaginate);

let CryptoNews = module.exports = mongoose.model('CryptoNews', cryptonewsSchema);
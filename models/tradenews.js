const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
ObjectId = mongoose.Types.ObjectId;

mongoosePaginate.paginate.options = {
    lean: true,
    limit: 20
};

// TradeNews Schema
let tradenewsSchema = mongoose.Schema({
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

tradenewsSchema.plugin(mongoosePaginate);

let TradeNews = module.exports = mongoose.model('TradeNews', tradenewsSchema);
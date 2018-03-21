const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
ObjectId = mongoose.Types.ObjectId;

mongoosePaginate.paginate.options = {
    lean: true,
    limit: 10
};
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
        paid_till: {
            type: Date
        }
    },
    {
        timestamps: true
    });

UserSchema.plugin(mongoosePaginate);

let User = module.exports = mongoose.model('User', UserSchema);
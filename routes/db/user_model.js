const mongoose = require('mongoose');

module.exports = mongoose.model('user', new mongoose.Schema({
    username : String,
    email : String,
    password : String,
    lockout: {
        state : Boolean,
        connectAttempt : Number
    },
    connect : {
        token: String,
        expirationDate: Date
    },
    reset: {
        token: String,
        expirationDate: Date
    },
    emailVerified: Boolean
}));


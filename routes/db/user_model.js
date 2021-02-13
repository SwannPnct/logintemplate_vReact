const mongoose = require('mongoose');

module.exports = mongoose.model('user', new mongoose.Schema({
    username : String,
    email : String,
    password : String,
    lockout: {
        state : Boolean,
        connectAttempt : Number
    },
    token : String
}));


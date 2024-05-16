const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    uid: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        required: true,
        enum: ['RFID', 'APP_USER', 'OTHER']
    },
    auth_id: String,  // Identifier in the eMSP (eMobility Service Provider) system
    issuer: String,   // The organization that issued the token
    valid: {
        type: Boolean,
        default: true
    },
    whitelist: {
        type: Boolean,
        default: false
    },
    last_updated: {
        type: Date,
        default: Date.now
    }
});

const Token = mongoose.model('Token', tokenSchema);

module.exports = Token;

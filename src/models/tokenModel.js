const mongoose = require('mongoose');
const tokenSchema = require('../Schemas/tokenSchema');
const TokenModel = mongoose.model('Token', tokenSchema);

module.exports = TokenModel;

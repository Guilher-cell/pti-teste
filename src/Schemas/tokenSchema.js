
const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Cadastro', 
    },
    token: {
        type: String,
        required: true,
    },
    
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300, // 300 segundos = 5 minutos
    },
});

module.exports = tokenSchema;

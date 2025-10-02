
const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Cadastro', // O nome do seu modelo de utilizador
    },
    token: {
        type: String,
        required: true,
    },
    // Data de criação para calcular a expiração.
    createdAt: {
        type: Date,
        default: Date.now,
        // O token expirará automaticamente após 10 minutos.
        // O MongoDB pode apagar documentos expirados automaticamente!
        expires: 300, // 300 segundos = 5 minutos
    },
});

module.exports = tokenSchema;

// Em: src/Schemas/ficheiroSchema.js
const mongoose = require('mongoose');

const ficheiroSchema = new mongoose.Schema({
    nomeOriginal: { type: String, required: true }, // Nome do ficheiro no computador do utilizador
    path: { type: String, required: true },         // Caminho onde o ficheiro foi guardado no servidor
    mimetype: { type: String, required: true },     // Tipo do ficheiro (ex: 'application/pdf')
    size: { type: Number, required: true },         // Tamanho em bytes
    
    // Ligação ao documento/pasta a que pertence
    documento: {
        type: mongoose.Schema.ObjectId,
        ref: 'Documento',
        required: true
    },
    // Ligação ao utilizador que fez o upload
    owner: {
        type: mongoose.Schema.ObjectId,
        ref: 'Cadastro',
        required: true
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    }
});

const FicheiroModel = mongoose.model('Ficheiro', ficheiroSchema);

module.exports = FicheiroModel;

const mongoose = require('mongoose');

const documentoSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: [true, 'O nome do documento é obrigatório.']
    },
    descricao: {
        type: String,
        trim: true
    },
    owner: {
        type: mongoose.Schema.ObjectId,
        ref: 'Cadastro', 
        required: true
    },
    
    ficheiros: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Ficheiro' 
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const DocumentoModel = mongoose.model('Documento', documentoSchema);

module.exports = DocumentoModel;

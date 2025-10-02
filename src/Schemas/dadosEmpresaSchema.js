const mongoose = require('mongoose');

const dadosEmpresaSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId, // mesmo ID do usuário
    ref: 'Cadastro',
    required: true
  },
  razaoSocial: { type: String, trim: true },
  endereco: {
    cep: { type: String, trim: true },
    logradouro: { type: String, trim: true },
    numero: { type: String, trim: true },
    complemento: { type: String, trim: true },
    bairro: { type: String, trim: true },
    cidade: { type: String, trim: true },
    estado: { type: String, trim: true },
    pais: { type: String, trim: true }
  },
  dadosCompletos: { type: Boolean, default: false } 
}, { timestamps: true });

module.exports = mongoose.model('DadosEmpresa', dadosEmpresaSchema);

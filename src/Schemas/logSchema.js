// src/Schemas/logSchema.js
const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: "Cadastro", required: true },
  empresaId: { type: mongoose.Schema.Types.ObjectId, ref: "Cadastro", required: true },
  usuarioNome: { type: String, required: true },
  acao: { type: String, required: true },      
  modulo: { type: String, required: true },     
  nomeDocumento: { type: String },            
  nomeArquivo: { type: String },  
  aprovadoPor: { type: String },              
  criadoEm: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Log", logSchema);

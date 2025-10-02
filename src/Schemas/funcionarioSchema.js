const mongoose = require('mongoose');
const argon2 = require('argon2');
const funcionarioSchema = new mongoose.Schema({
  empresaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cadastro', required: true },
  nome: { type: String, required: true },
  usuario: { type: String, required: true, unique: true },
  cargo: { type: String },
  senha: { type: String, required: true },
  role: { type: String, default: "funcionario" },
  permissoes: {
    dashboardISO: { type: Boolean, default: false },
    documentosGerais: { type: Boolean, default: false }
  }
}, { timestamps: true });

funcionarioSchema.methods.isCorrectPassword = async function (candidatePassword) {
  return argon2.verify(this.senha, candidatePassword);
};

module.exports = mongoose.model('Funcionario', funcionarioSchema);

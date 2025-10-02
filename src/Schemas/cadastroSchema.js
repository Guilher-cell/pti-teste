const mongoose = require('mongoose');
const argon2 = require('argon2')

const cadastroSchema = new mongoose.Schema({
  user: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  cnpj: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  twoFAEnabled: { type: Boolean, default: false }, 
  twoFACode: { type: String },                     
  twoFACodeExpires: { type: Date },
  ativo: { type: Boolean, default: false },  
  role: {type: String , enum: ["admin","master"], default: "master"},
  permissoes: {
  dashboardISO: { type: Boolean, default: true },
  documentosGerais: { type: Boolean, default: true }
  }}, { timestamps: true });

cadastroSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    this.password = await argon2.hash(this.password);
    next()
  } catch(e) {
    next(e);
  }
});


cadastroSchema.methods.isCorrectPassword = async function(candidatePassword) {
  try {
    return await argon2.verify(this.password, candidatePassword);
  } catch (err) {
    return false;
  }
}

const CadastroModel = mongoose.model('Cadastro', cadastroSchema);
module.exports = CadastroModel;

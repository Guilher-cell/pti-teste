const mongoose = require("mongoose");

const documentoISOSchema = new mongoose.Schema({
  capitulo: { type: String, required: true }, // Ex: "4-1"
  nome: { type: String, default: "" },
  descricao: { type: String, default: "" },
  ficheiros: [{ type: mongoose.Schema.Types.ObjectId, ref: "Ficheiro" }],
  checklist: [{ type: String }], // <-- ADICIONA
  progresso: { type: Number, default: 0 }, // <-- ADICIONA
  criadoPor: { type: mongoose.Schema.Types.ObjectId, ref: "Cadastro" },
  ultimaAlteracao: { type: Date },
  alteradoPor: { type: mongoose.Schema.Types.ObjectId, ref: "Cadastro" },
  empresaId: { type: mongoose.Schema.Types.ObjectId, ref: "Cadastro", index: true, required: true }
}, { timestamps: true });



module.exports = mongoose.models.DocumentoISO || mongoose.model("DocumentoISO", documentoISOSchema);

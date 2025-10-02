const mongoose = require("mongoose");

const documentoSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true },
    descricao: { type: String, default: "" },
    ficheiros: [{ type: mongoose.Schema.Types.ObjectId, ref: "Ficheiro" }],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "Cadastro", required: true },
    empresaId: { type: mongoose.Schema.Types.ObjectId, ref: "Cadastro", index: true, required: true },
    criadoPor: { type: mongoose.Schema.Types.ObjectId, ref: "Cadastro" },
    ultimaAlteracao: { type: Date },
    alteradoPor: {type: mongoose.Schema.Types.ObjectId,refPath: "alteradoPorModel", },
    alteradoPorModel: {type: String,enum: ["Cadastro", "Funcionario"],},
    ultimoAcesso: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Documento || mongoose.model("Documento", documentoSchema);

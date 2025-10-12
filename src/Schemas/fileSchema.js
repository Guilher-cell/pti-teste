const mongoose = require("mongoose");

const ficheiroSchema = new mongoose.Schema({
  nomeOriginal: { type: String, required: true },
  nomePersonalizado: { type: String, default: "" }, 
  path: { type: String, required: true },
  mimetype: { type: String, required: true },
  size: { type: Number, required: true },
  documento: { type: mongoose.Schema.Types.ObjectId, ref: "DocumentoISO" },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "Cadastro" },
  aprovadoPor: { type: String },
  aprovadoEm: { type: Date },
}, { timestamps: true });

module.exports = mongoose.models.Ficheiro || mongoose.model("Ficheiro", ficheiroSchema);

const mongoose = require("mongoose");

const ficheiroSchema = new mongoose.Schema({
  nomeOriginal: { type: String, required: true },
  path: { type: String, required: true },
  mimetype: { type: String, required: true },
  size: { type: Number, required: true },
  documento: { type: mongoose.Schema.Types.ObjectId, ref: "Documento", required: true },
  aprovadoPor: { type: String, default: null },
  aprovadoEm: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.models.Ficheiro || mongoose.model("Ficheiro", ficheiroSchema);

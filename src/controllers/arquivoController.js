const { v2: cloudinary } = require("cloudinary");
const multer = require("multer");
const DocumentoModel = require("../Schemas/documentoSchema");
const FicheiroModel = require("../Schemas/ficheiroSchema");

// Configuração Multer (buffer em memória)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ===============================
// UPLOAD
// ===============================
exports.uploadFicheiro = [
  upload.single("file"),
  async (req, res) => {
    try {
      const documentoId = req.params.id;
      const userId = req.session.user._id;

      if (!req.file) {
        return res.status(400).json({ error: "Nenhum ficheiro enviado" });
      }

      // Upload no Cloudinary
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "meus_uploads", resource_type: "auto" },
          (err, result) => (err ? reject(err) : resolve(result))
        );
        stream.end(req.file.buffer);
      });

      // Salva no Mongo
      const ficheiro = await FicheiroModel.create({
        nomeOriginal: req.file.originalname,
        url: result.secure_url,
        public_id: result.public_id,
        mimetype: req.file.mimetype,
        size: req.file.size,
        documento: documentoId,
        owner: userId,
      });

      await DocumentoModel.findByIdAndUpdate(documentoId, {
        $push: { ficheiros: ficheiro._id },
      });

      res.status(200).json({ success: true, ficheiro });
    } catch (err) {
      console.error("ERRO uploadFile:", err);
      res.status(500).json({ error: err.message });
    }
  },
];

// ===============================
// APAGAR FICHEIRO
// ===============================
exports.apagarFicheiro = async (req, res) => {
  try {
    const { id, fileId } = req.params;
    const userId = req.session.user._id;

    const ficheiro = await FicheiroModel.findOne({
      _id: fileId,
      documento: id,
      owner: userId,
    });

    if (!ficheiro)
      return res.status(404).json({ error: "Ficheiro não encontrado" });

    // Remove do Cloudinary
    await cloudinary.uploader.destroy(ficheiro.public_id, {
      resource_type: "auto",
    });

    // Remove do Mongo
    await DocumentoModel.findByIdAndUpdate(id, {
      $pull: { ficheiros: ficheiro._id },
    });
    await ficheiro.deleteOne();

    res.json({ success: true });
  } catch (err) {
    console.error("ERRO apagarFicheiro:", err);
    res.status(500).json({ error: err.message });
  }
};

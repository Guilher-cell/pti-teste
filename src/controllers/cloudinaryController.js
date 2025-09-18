const { v2: cloudinary } = require("cloudinary");
const multer = require("multer");

// Configurações do Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configuração do Multer para buffer na memória
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Controller para upload
exports.uploadFile = [
  upload.single("file"),
  (req, res) => {
    console.log("UPLOAD chamado, req.file:", req.file);

    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado" });
    }

    try {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "meus_uploads", resource_type: "auto" }, 
        (error, result) => {
          if (error) {
            console.error("Erro no Cloudinary:", error);
            return res.status(500).json({ error: error.message });
          }
          console.log("Cloudinary result:", result);
          return res.json({
            url: result.secure_url,
            public_id: result.public_id,
            resource_type: result.resource_type,
            bytes: result.bytes
          });
        }
      );

      stream.end(req.file.buffer);

    } catch (err) {
      console.error("Erro interno:", err);
      res.status(500).json({ error: err.message });
    }
  }
];

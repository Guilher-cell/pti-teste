const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve("public", "uploads")); 
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  }
});

function fileFilter(req, file, cb) {
  const allowedMimes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/msword", // Word antigo (.doc)
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // Word novo (.docx)
    "application/vnd.ms-excel", // Excel antigo (.xls)
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // Excel novo (.xlsx)
    "application/vnd.ms-powerpoint", // PowerPoint antigo (.ppt)
    "application/vnd.openxmlformats-officedocument.presentationml.presentation" // PowerPoint novo (.pptx)
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Formato inválido. Apenas imagens, PDF, Word, Excel e PowerPoint são permitidos."));
  }
}


module.exports = multer({ storage, fileFilter });

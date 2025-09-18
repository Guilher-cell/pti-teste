// Em: src/config/multerConfig.js
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Define o diretório onde os ficheiros serão guardados
const uploadDir = path.resolve(__dirname, '..', '..', 'public', 'uploads');

module.exports = {
    // Diretório de destino para os uploads
    dest: uploadDir,
    
    // Configuração do armazenamento
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            // Gera 16 bytes de dados aleatórios em formato hexadecimal
            crypto.randomBytes(16, (err, hash) => {
                if (err) cb(err);

                // Cria um nome de ficheiro único para evitar sobreposições
                // Ex: 1a2b3c4d5e6f7g8h-meu_documento.pdf
                const fileName = `${hash.toString('hex')}-${file.originalname}`;
                
                cb(null, fileName);
            });
        },
    }),
    
    // Limites para o upload
    limits: {
        fileSize: 5 * 1024 * 1024, // Limite de 5MB por ficheiro
    },
    
    // Filtro de ficheiros (opcional, mas recomendado)
    fileFilter: (req, file, cb) => {
        const allowedMimes = [
            'image/jpeg',
            'image/pjpeg',
            'image/png',
            'image/gif',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
        ];

        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true); // Aceita o ficheiro
        } else {
            // Rejeita o ficheiro com uma mensagem de erro
            cb(new Error('Tipo de ficheiro inválido.'));
        }
    },
};
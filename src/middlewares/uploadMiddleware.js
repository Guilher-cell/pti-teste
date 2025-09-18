// Em: src/middlewares/uploadMiddleware.js
const multer = require('multer');
const multerConfig = require('../config/multerConfig');

// Cria a instância do multer
const upload = multer(multerConfig).array('ficheiros', 5);

// Este é o nosso "wrapper"
module.exports = (req, res, next) => {
    upload(req, res, (err) => {
        // Se o multer gerar um erro (ex: tipo de ficheiro inválido, tamanho excedido)
        if (err) {
            // Nós capturamos o erro e o enviamos para o utilizador como uma flash message
            if (err instanceof multer.MulterError) {
                req.flash('errors', `Erro de Upload: ${err.message}. O limite é de 5MB.`);
            } else {
                req.flash('errors', err.message);
            }
            // E redirecionamos de volta
            return req.session.save(() => res.redirect('back'));
        }
        // Se não houver erro, o processo continua para o próximo middleware (o seu controlador)
        next();
    });
};
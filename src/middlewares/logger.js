// src/middlewares/logger.js
const Log = require("../Schemas/logSchema");

module.exports = function registrarLog(acao, modulo, extras = {}) {
  return async function (req, res, next) {
    try {
      if (req.session.user) {
        await Log.create({
          usuarioId: req.session.user._id,
          empresaId: req.session.user.empresaId || req.session.user._id,
          usuarioNome: req.session.user.user,
          acao,
          modulo,
          nomeDocumento: extras.nomeDocumento || null,
          nomeArquivo: extras.nomeArquivo || null
        });
      }
    } catch (err) {
      console.error("❌ Erro ao salvar log:", err);
    }
    next();
  };
};

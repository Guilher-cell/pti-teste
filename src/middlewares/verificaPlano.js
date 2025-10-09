// src/middlewares/verificaPlano.js
const CadastroModel = require('../Schemas/cadastroSchema');

module.exports = (nivel) => {
  return async (req, res, next) => {
    if (!req.session.user) {
      req.flash("errors", "Você precisa estar logado.");
      return res.redirect("/login");
    }

    const user = await CadastroModel.findById(req.session.user._id);

    if (!user) {
      req.flash("errors", "Usuário não encontrado.");
      return res.redirect("/login");
    }

    // Se plano expirou → força freemium
    if (user.planoExpiraEm && new Date(user.planoExpiraEm) < new Date()) {
      user.plano = "freemium";
    }

    // Se a rota pede premium e o usuário está freemium
    if (nivel === "premium" && user.plano === "freemium") {
      req.flash("errors", "Essa funcionalidade é exclusiva para planos pagos.");
      return res.redirect("/planos");
    }

    // Se passou, segue
    next();
  };
};

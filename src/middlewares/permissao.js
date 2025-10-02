module.exports = function permissao(permissaoNecessaria) {
  return (req, res, next) => {
    if (!req.session.user) {
      req.flash("errors", "Você precisa estar logado.");
      return res.redirect("/login");
    }

    const { role, permissoes } = req.session.user;

    // Master e Admin podem tudo
    if (role === "master" || role === "admin") {
      return next();
    }

    // Funcionário: checa permissões específicas
    if (role === "funcionario") {
      if (permissoes && permissoes[permissaoNecessaria]) {
        return next();
      }

      req.flash("errors", "Você não tem permissão para acessar essa área.");
      return res.redirect("/");
    }

    // fallback
    req.flash("errors", "Acesso negado.");
    return res.redirect("/");
  };
};

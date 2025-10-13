const Log = require("../Schemas/logSchema");

exports.logsEmpresa = async (req, res) => {
  try {
    const empresaId = req.session.user.empresaId || req.session.user._id;
    const logs = await Log.find({ empresaId })
      .sort({ criadoEm: -1 })
      .limit(100);

    res.render("logs_empresa", { csrfToken: req.csrfToken(), logs, user: req.session.user });
  } catch (err) {
    console.error("Erro logs da empresa:", err);
    req.flash("errors", "Erro ao carregar logs.");
    res.redirect("/");
  }
};

exports.logsAdmin = async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "admin") {
      req.flash("errors", "Acesso restrito.");
      return res.redirect("/");
    }

    const logs = await Log.find()
      .sort({ criadoEm: -1 })
      .limit(200)
      .populate("empresaId", "user");

    res.render("logs_admin", { 
      csrfToken: req.csrfToken(), 
      logs, 
      user: req.session.user 
    });
  } catch (err) {
    console.error("Erro logs admin:", err);
    req.flash("errors", "Erro ao carregar logs.");
    res.redirect("/");
  }
};


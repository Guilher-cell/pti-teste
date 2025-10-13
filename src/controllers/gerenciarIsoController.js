const DocumentoISO = require("../Schemas/documentoISOSchema");

exports.index = async (req, res) => {
  try {
    const empresaId = req.session.user.empresaId;

   
    const documentos = await DocumentoISO.find({ empresaId }).populate("ficheiros");

  
    const capitulos = {};

    documentos.forEach(doc => {
      const capituloBase = doc.capitulo.split("-")[0];

      let progresso = 0;
      const totalChecks = 3; 

     
      if (doc.ficheiros && doc.ficheiros.length > 0) progresso += 50;

     
      const marcados = doc.checklist ? doc.checklist.length : 0;
      progresso += Math.round((marcados / totalChecks) * 50);

      if (!capitulos[capituloBase]) {
        capitulos[capituloBase] = { soma: 0, qtd: 0 };
      }
      capitulos[capituloBase].soma += progresso;
      capitulos[capituloBase].qtd += 1;
    });

    const progressoCapitulos = {};
    Object.keys(capitulos).forEach(c => {
      progressoCapitulos[c] = Math.round(capitulos[c].soma / capitulos[c].qtd);
    });

    res.render("gerenciar-ISO-9001", {
      progressoCapitulos,
      user: req.session.user
    });
  } catch (e) {
    console.error("Erro ao carregar gerenciar ISO:", e);
    req.flash("errors", "Erro ao carregar capítulos.");
    return req.session.save(() => res.redirect("/"));
  }
};
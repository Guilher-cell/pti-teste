const DocumentoModel = require("../Schemas/documentoSchema");
const FicheiroModel = require("../Schemas/fileSchema");
const Log = require("../Schemas/logSchema");
function empresaScope(req) {
  const userId = req.session.user?._id;
  const empresaId = req.session.user?.empresaId || userId;
  return { userId, empresaId };
}


function empresaFilter(empresaId, userId) {
  return { $or: [{ empresaId }, { owner: userId }] };
}


exports.index = async (req, res) => {
  try {
    const { userId, empresaId } = empresaScope(req);

    const documentos = await DocumentoModel.find(empresaFilter(empresaId, userId))
      .sort({ createdAt: -1 })
      .populate("ficheiros")
     
      .populate({ path: "alteradoPor", select: "user nome usuario" });

    return res.render("documentos", {
      documentos,
      user: req.session.user,
    });
  } catch (e) {
    console.log("ERRO AO BUSCAR DOCUMENTOS:", e);
    req.flash("errors", "Ocorreu um erro ao carregar os seus documentos.");
    return req.session.save(() => res.redirect("/"));
  }
};


exports.criar = async (req, res) => {
  try {
    const { empresaId, userId } = empresaScope(req);
    const { nome, descricao } = req.body;

    if (!nome) {
      req.flash("errors", "O nome do documento é obrigatório.");
      return req.session.save(() => res.redirect("/documentos"));
    }

    const novoDocumento = await DocumentoModel.create({
      nome,
      descricao,
      empresaId,
      owner: empresaId,
      criadoPor: userId,
      ultimaAlteracao: new Date(),
      alteradoPor: userId,
      alteradoPorModel: req.session.user.role === "funcionario" ? "Funcionario" : "Cadastro",
    });

    
    await Log.create({
      usuarioId: userId,
      empresaId,
      usuarioNome: req.session.user.user,
      acao: "Criou documento",
      modulo: "Documentos Gerais",
      nomeDocumento: novoDocumento.nome
    });

    req.flash("success", `A pasta "${nome}" foi criada com sucesso!`);
    return req.session.save(() => res.redirect("/documentos"));
  } catch (e) {
    console.log("ERRO AO CRIAR DOCUMENTO:", e);
    req.flash("errors", "Ocorreu um erro no sistema ao tentar criar o documento.");
    return req.session.save(() => res.redirect("/documentos"));
  }
};


exports.detalhe = async (req, res) => {
  try {
    const { empresaId, userId } = empresaScope(req);

    const documento = await DocumentoModel.findOne({
      _id: req.params.id,
      ...empresaFilter(empresaId, userId),
    })
      .populate("ficheiros")
      .populate({ path: "alteradoPor", select: "user nome usuario" });

    if (!documento) {
      req.flash("errors", "Documento não encontrado ou você não tem permissão para acessá-lo.");
      return req.session.save(() => res.redirect("/documentos"));
    }

    return res.render("documentoDetalhe", {
      documento,
      user: req.session.user,
    });
  } catch (e) {
    console.log("ERRO AO BUSCAR DETALHE DO DOCUMENTO:", e);
    req.flash("errors", "Ocorreu um erro ao carregar o documento.");
    return req.session.save(() => res.redirect("/documentos"));
  }
};


exports.editar = async (req, res) => {
  try {
    const { empresaId, userId } = empresaScope(req);
    const { nome, descricao } = req.body;

    if (!nome) {
      req.flash("errors", "O nome do documento não pode ficar em branco.");
      return req.session.save(() => res.redirect(`/documentos/${req.params.id}`));
    }

    const alteradoPorModel = req.session.user.role === "funcionario" ? "Funcionario" : "Cadastro";

    const documento = await DocumentoModel.findOneAndUpdate(
      { _id: req.params.id, ...empresaFilter(empresaId, userId) },
      {
        nome,
        descricao,
        ultimaAlteracao: new Date(),
        alteradoPor: userId,
        alteradoPorModel, 
      },
      { new: true, runValidators: true }
    );

    if (!documento) {
      req.flash("errors", "Documento não encontrado ou você não tem permissão para editá-lo.");
      return req.session.save(() => res.redirect("/documentos"));
    }

    req.flash("success", "Pasta atualizada com sucesso!");
    return req.session.save(() => res.redirect(`/documentos/${req.params.id}`));
  } catch (e) {
    console.log("ERRO AO EDITAR DOCUMENTO:", e);
    req.flash("errors", "Ocorreu um erro no sistema ao tentar editar a pasta.");
    return req.session.save(() => res.redirect(`/documentos/${req.params.id}`));
  }
};


exports.apagar = async (req, res) => {
  try {
    const { empresaId, userId } = empresaScope(req);

    const documento = await DocumentoModel.findOne({
      _id: req.params.id,
      ...empresaFilter(empresaId, userId),
    });

    if (!documento) {
      req.flash("errors", "Documento não encontrado ou você não tem permissão para apagá-lo.");
      return req.session.save(() => res.redirect("/documentos"));
    }

    await FicheiroModel.deleteMany({ documento: documento._id });
    await documento.deleteOne();

     await Log.create({
      usuarioId: userId,
      empresaId,
      usuarioNome: req.session.user.user,
      acao: "Apagou Documento",
      modulo: "Documentos Gerais",
      nomeDocumento: documento.nome
    });

    req.flash("success", `A pasta "${documento.nome}" foi apagada com sucesso.`);
    return req.session.save(() => res.redirect("/documentos"));
  } catch (e) {
    console.log("ERRO AO APAGAR DOCUMENTO:", e);
    req.flash("errors", "Ocorreu um erro no sistema ao tentar apagar a pasta.");
    return req.session.save(() => res.redirect("/documentos"));
  }
};


exports.aprovarFicheiro = async (req, res) => {
  try {
    const { empresaId, userId } = empresaScope(req);
    const { fileId, id: documentoId } = req.params;

    const documento = await DocumentoModel.findOne({
      _id: documentoId,
      ...empresaFilter(empresaId, userId),
    });

    if (!documento) {
      req.flash("errors", "Documento não encontrado ou sem permissão.");
      return req.session.save(() => res.redirect("/documentos"));
    }

    const ficheiro = await FicheiroModel.findOneAndUpdate(
      { _id: fileId, documento: documento._id },
      { approvedBy: userId, approvedAt: new Date() },
      { new: true }
    ).populate("approvedBy", "user nome usuario");

    if (!ficheiro) {
      req.flash("errors", "Ficheiro não encontrado para este documento.");
      return req.session.save(() => res.redirect(`/documentos/${documentoId}`));
    }

    // Atualiza auditoria do documento
    const alteradoPorModel = req.session.user.role === "funcionario" ? "Funcionario" : "Cadastro";
    await DocumentoModel.findByIdAndUpdate(documentoId, {
      $set: {
        ultimaAlteracao: new Date(),
        alteradoPor: userId,
        alteradoPorModel,
      },
    });

    req.flash("success", "Ficheiro aprovado com sucesso!");
    return req.session.save(() => res.redirect(`/documentos/${documentoId}`));
  } catch (e) {
    console.log("ERRO AO APROVAR FICHEIRO:", e);
    req.flash("errors", "Ocorreu um erro ao aprovar o ficheiro.");
    return req.session.save(() => res.redirect(`/documentos/${req.params.id}`));
  }
};

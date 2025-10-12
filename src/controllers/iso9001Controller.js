const DocumentoISO = require("../Schemas/documentoISOSchema");
const Ficheiro = require("../Schemas/fileSchema");
const Log = require("../Schemas/logSchema");
const multer = require("../config/multerConfig");

// =====================================================
// 🔹 Helper: Escopo da empresa
// =====================================================
function empresaScope(req) {
  const userId = req.session.user?._id;
  const empresaId = req.session.user?.empresaId || userId;
  return { userId, empresaId };
}

// =====================================================
// 🔹 Mostrar Capítulo ou Subcapítulo
// =====================================================
exports.mostrarCapitulo = async (req, res) => {
  try {
    const capitulo = req.params.capitulo;
    const empresaId = req.session.user.empresaId;
    const isSubcap = capitulo.includes("-");

    if (isSubcap) {
      const doc = await DocumentoISO.findOne({ capitulo, empresaId })
        .populate("ficheiros")
        .populate("alteradoPor", "user");

      const documentos = doc ? [doc] : [];
      return res.render(`paginas_iso9001/${capitulo}`, {
        documentos,
        capitulo,
        user: req.session.user,
        csrfToken: req.csrfToken(),
      });
    }

    const documentos = await DocumentoISO.find({
      capitulo: new RegExp(`^${capitulo}-`),
      empresaId,
    }).populate("ficheiros");

    const progressoCapitulo = {};
    documentos.forEach(d => {
      progressoCapitulo[d.capitulo] = d.progresso || 0;
    });

    return res.render(`paginas_iso9001/${capitulo}`, {
      documentos,
      capitulo,
      progressoCapitulo,
      user: req.session.user,
      csrfToken: req.csrfToken(),
    });

  } catch (e) {
    console.error("❌ Erro mostrarCapitulo:", e);
    req.flash("errors", "Erro ao carregar capítulo.");
    return req.session.save(() => res.redirect("/"));
  }
};

// =====================================================
// 🔹 Upload de Arquivos (corrigido para salvar nomePersonalizado)
// =====================================================
exports.uploadCapitulo = (req, res) => {
  // ✅ Usa fields() para aceitar múltiplos nomes
  const upload = multer.fields([
    { name: "ficheiros", maxCount: 10 },
    { name: "ficheiros[]", maxCount: 10 }, // aceita os dois formatos
  ]);

  const capitulo = req.params.capitulo;

  upload(req, res, async (err) => {
    if (err) {
      console.error("❌ Erro upload:", err);
      req.flash("errors", [err.message]);
      return res.redirect(`/iso9001/${capitulo}`);
    }

    try {
      const { userId, empresaId } = empresaScope(req);

      // ✅ Pega os arquivos de forma segura
      const files =
        (req.files && (req.files.ficheiros || req.files["ficheiros[]"])) || [];

      if (!files || files.length === 0) {
        req.flash("errors", "Nenhum arquivo enviado.");
        return res.redirect(`/iso9001/${capitulo}`);
      }

      // ✅ Garante que campos de texto também sejam capturados
      const nomesPersonalizadosArray = Array.isArray(req.body["nomesPersonalizados[]"])
        ? req.body["nomesPersonalizados[]"]
        : Array.isArray(req.body.nomesPersonalizados)
        ? req.body.nomesPersonalizados
        : [req.body.nomesPersonalizados || req.body["nomesPersonalizados[]"]];

      const aprovadoPorArray = Array.isArray(req.body["aprovadoPor[]"])
        ? req.body["aprovadoPor[]"]
        : Array.isArray(req.body.aprovadoPor)
        ? req.body.aprovadoPor
        : [req.body.aprovadoPor || req.body["aprovadoPor[]"]];

      // ✅ Cria/atualiza o documento ISO
      const documento = await DocumentoISO.findOneAndUpdate(
        { capitulo, empresaId },
        { $setOnInsert: { capitulo, empresaId, criadoPor: userId } },
        { upsert: true, new: true }
      );

      // ✅ Cria cada ficheiro com nome personalizado
      const ficheiros = await Promise.all(
        files.map(async (file, i) => {
          const nomePersonalizado = nomesPersonalizadosArray[i] || file.originalname;
          const aprovador = aprovadoPorArray[i] || null;

          const ficheiro = new Ficheiro({
            nomeOriginal: file.originalname,
            nomePersonalizado,
            path: file.filename,
            mimetype: file.mimetype,
            size: file.size,
            documento: documento._id,
            owner: userId,
            aprovadoPor: aprovador,
            aprovadoEm: aprovador ? new Date() : null,
          });

          await ficheiro.save();

          // ✅ Log automático
          await Log.create({
            usuarioId: userId,
            empresaId,
            usuarioNome: req.session.user.user,
            acao: "Upload de arquivo",
            modulo: "ISO 9001",
            nomeDocumento: `Capítulo ${capitulo}`,
            nomeArquivo: nomePersonalizado,
            aprovadoPor: ficheiro.aprovadoPor || "Não informado",
          });

          return ficheiro._id;
        })
      );

      // ✅ Atualiza o documento
      documento.ficheiros.push(...ficheiros);
      documento.ultimaAlteracao = new Date();
      documento.alteradoPor = userId;
      documento.progresso = calcularProgresso(documento, 3);
      await documento.save();

      req.flash("success", "Arquivos enviados com sucesso!");
      return res.redirect(`/iso9001/${capitulo}`);
    } catch (e) {
      console.error("🔥 Erro uploadCapitulo:", e);
      req.flash("errors", ["Erro ao salvar arquivos."]);
      return res.redirect(`/iso9001/${capitulo}`);
    }
  });
};


// =====================================================
// 🔹 Apagar Ficheiro
// =====================================================
exports.apagarFicheiroCapitulo = async (req, res) => {
  try {
    const { capitulo, fileId } = req.params;
    const { userId, empresaId } = empresaScope(req);

    const ficheiro = await Ficheiro.findById(fileId);
    if (!ficheiro) {
      req.flash("errors", "Arquivo não encontrado.");
      return res.redirect(`/iso9001/${capitulo}`);
    }

    const documento = await DocumentoISO.findOne({ capitulo, empresaId });
    if (!documento) {
      req.flash("errors", "Documento do capítulo não encontrado.");
      return res.redirect(`/iso9001/${capitulo}`);
    }

    if (
      String(ficheiro.owner) !== String(userId) &&
      String(documento.empresaId) !== String(empresaId)
    ) {
      req.flash("errors", "Você não tem permissão para apagar este arquivo.");
      return res.redirect(`/iso9001/${capitulo}`);
    }

    await ficheiro.deleteOne();
    await DocumentoISO.findOneAndUpdate(
      { capitulo, empresaId },
      {
        $pull: { ficheiros: ficheiro._id },
        ultimaAlteracao: new Date(),
        alteradoPor: userId,
      }
    );

    const docAtual = await DocumentoISO.findOne({ capitulo, empresaId }).populate("ficheiros");
    if (docAtual) {
      docAtual.progresso = calcularProgresso(docAtual, 3);
      await docAtual.save();
    }

    await Log.create({
      usuarioId: userId,
      empresaId,
      usuarioNome: req.session.user.user,
      acao: "Apagou arquivo",
      modulo: "ISO 9001",
      nomeDocumento: `Capítulo ${capitulo}`,
      nomeArquivo: ficheiro.nomePersonalizado || ficheiro.nomeOriginal,
    });

    req.flash("success", "Arquivo apagado com sucesso!");
    return res.redirect(`/iso9001/${capitulo}`);
  } catch (e) {
    console.error("❌ Erro apagarFicheiroCapitulo:", e);
    req.flash("errors", "Erro ao apagar o arquivo.");
    return res.redirect(`/iso9001/${req.params.capitulo}`);
  }
};

// =====================================================
// 🔹 Calcular Progresso
// =====================================================
function calcularProgresso(documento, totalChecks) {
  let progresso = 0;
  if (documento.ficheiros && documento.ficheiros.length > 0) progresso += 50;
  const marcados = documento.checklist ? documento.checklist.length : 0;
  if (totalChecks > 0) progresso += Math.round((marcados / totalChecks) * 50);
  return progresso;
}

// =====================================================
// 🔹 Salvar Checklist
// =====================================================
exports.salvarChecklist = async (req, res) => {
  try {
    const { capitulo } = req.params;
    const { userId, empresaId } = empresaScope(req);
    const checks = Object.keys(req.body).filter(k => k.startsWith("chk_"));

    let documento = await DocumentoISO.findOne({ capitulo, empresaId });
    if (!documento) documento = new DocumentoISO({ capitulo, empresaId, criadoPor: userId });

    documento.checklist = checks;
    documento.ultimaAlteracao = new Date();
    documento.alteradoPor = userId;
    documento.progresso = calcularProgresso(documento, 3);
    await documento.save();

    req.flash("success", "Checklist salva com sucesso!");
    return res.redirect(`/iso9001/${capitulo}`);
  } catch (e) {
    console.error("❌ Erro salvarChecklist:", e);
    req.flash("errors", "Erro ao salvar checklist.");
    return res.redirect(`/iso9001/${req.params.capitulo}`);
  }
};

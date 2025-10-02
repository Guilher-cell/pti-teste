const DocumentoISO = require("../Schemas/documentoISOSchema");
const Ficheiro = require("../Schemas/fileSchema");
const Log = require("../Schemas/logSchema");
const multer = require("../config/multerConfig");

// ===============================
// Helper: escopo da empresa
// ===============================
function empresaScope(req) {
  const userId = req.session.user?._id;
  const empresaId = req.session.user?.empresaId || userId;
  return { userId, empresaId };
}

// ===============================
// RENDERIZA UM CAPÍTULO ISO
// ===============================
exports.mostrarCapitulo = async (req, res) => {
  try {
    const capitulo = req.params.capitulo;
    const empresaId = req.session.user.empresaId;

    const documentos = await DocumentoISO.find({ capitulo, empresaId })
      .populate("ficheiros")
      .populate("alteradoPor", "user");

    return res.render(`paginas_iso9001/${capitulo}`, {
      documentos,
      capitulo,
      user: req.session.user
    });
  } catch (e) {
    console.error("❌ Erro mostrarCapitulo:", e);
    req.flash("errors", "Erro ao carregar capítulo.");
    return req.session.save(() => res.redirect("/"));
  }
};

// ===============================
// UPLOAD DE ARQUIVOS NO CAPÍTULO
// ===============================
exports.uploadCapitulo = (req, res) => {
  const upload = multer.array("ficheiros", 10);
  const capitulo = req.params.capitulo;

  upload(req, res, async (err) => {
    if (err) {
      console.error("❌ Erro upload:", err);
      req.flash("errors", [err.message]);
      return res.redirect(`/iso9001/${capitulo}`);
    }

    try {
      const userId = req.session.user._id;
      const empresaId = req.session.user.empresaId;

      if (!req.files || req.files.length === 0) {
        req.flash("errors", "Nenhum arquivo enviado.");
        return res.redirect(`/iso9001/${capitulo}`);
      }

      const documento = await DocumentoISO.findOneAndUpdate(
        { capitulo, empresaId },
        { $setOnInsert: { capitulo, empresaId, criadoPor: userId } },
        { upsert: true, new: true }
      );

      const aprovadoPorArray = Array.isArray(req.body.aprovadoPor) ? req.body.aprovadoPor : [req.body.aprovadoPor];

      const ficheiros = await Promise.all(
        req.files.map(async (file, i) => {
          const aprovador = aprovadoPorArray[i] || null;
          const ficheiro = new Ficheiro({
            nomeOriginal: file.originalname,
            path: file.filename,
            mimetype: file.mimetype,
            size: file.size,
            documento: documento._id,
            owner: userId,
            aprovadoPor: aprovador,
            aprovadoEm: aprovador ? new Date() : null,
          });
          await ficheiro.save();

          // 🔹 LOG: upload de arquivo ISO
          await Log.create({
            usuarioId: userId,
            empresaId,
            usuarioNome: req.session.user.user,
            acao: `Upload de arquivo`,
            modulo: `ISO 9001`,
            nomeDocumento: `Capítulo ${capitulo}`,
            nomeArquivo: file.originalname,
            aprovadoPor: ficheiro.aprovadoPor || "Não informado",
          });

          return ficheiro._id;
        })
      );

      documento.ficheiros.push(...ficheiros);
      documento.ultimaAlteracao = new Date();
      documento.alteradoPor = userId;
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

// ===============================
// APAGAR UM FICHEIRO DO CAPÍTULO
// ===============================
exports.apagarFicheiroCapitulo = async (req, res) => {
  try {
    const { capitulo, fileId } = req.params;
    const { userId, empresaId } = empresaScope(req);

    const ficheiro = await Ficheiro.findById(fileId);
    if (!ficheiro) {
      req.flash("errors", "Arquivo não encontrado.");
      return res.redirect(`/iso9001/${capitulo}`);
    }

    // Confere se pertence ao documento da empresa
    const documento = await DocumentoISO.findOne({ capitulo, empresaId });
    if (!documento) {
      req.flash("errors", "Documento do capítulo não encontrado.");
      return res.redirect(`/iso9001/${capitulo}`);
    }

    // Confere permissão
    if (
      String(ficheiro.owner) !== String(userId) &&
      String(documento.empresaId) !== String(empresaId)
    ) {
      req.flash("errors", "Você não tem permissão para apagar este arquivo.");
      return res.redirect(`/iso9001/${capitulo}`);
    }

    // Apaga o ficheiro
    await ficheiro.deleteOne();

    // Remove a referência no documento ISO
    await DocumentoISO.findOneAndUpdate(
      { capitulo, empresaId },
      {
        $pull: { ficheiros: ficheiro._id },
        ultimaAlteracao: new Date(),
        alteradoPor: userId,
      }
    );

    // 🔹 LOG: exclusão de arquivo ISO
    await Log.create({
      usuarioId: userId,
      empresaId,
      usuarioNome: req.session.user.user,
      acao: `Apagou arquivo`,
      modulo: `ISO 9001 `,
      nomeDocumento: `Capítulo ${capitulo}`,
      nomeArquivo: ficheiro.nomeOriginal,
    });

    req.flash("success", "Arquivo apagado com sucesso!");
    return res.redirect(`/iso9001/${capitulo}`);
  } catch (e) {
    console.error("❌ Erro apagarFicheiroCapitulo:", e);
    req.flash("errors", "Erro ao apagar o arquivo.");
    return res.redirect(`/iso9001/${req.params.capitulo}`);
  }
};

const Documento = require("../Schemas/documentoSchema");
const Ficheiro = require("../Schemas/fileSchema");
const multer = require("../config/multerConfig");
const fs = require("fs");
const path = require("path");
const Log = require("../Schemas/logSchema");
// ===============================
// UPLOAD DE FICHEIROS
// ===============================
exports.uploadFicheiro = (req, res) => {
  const uploadHandler = multer.array("ficheiros", 10);

  uploadHandler(req, res, async (err) => {
    if (err) {
      console.error("❌ Erro do Multer:", err);
      req.flash("errors", [err.message]);
      return res.redirect(`/documentos/${req.params.id}`);
    }

    try {
      const documentoId = req.params.id;
      const userId = String(req.session.user?._id);
      const usuarioNome = req.session.user.user;
      const alteradoPorModel = req.session.user.role === "funcionario" ? "Funcionario" : "Cadastro";

      if (!req.files || req.files.length === 0) {
        req.flash("errors", "Nenhum arquivo enviado.");
        return res.redirect(`/documentos/${req.params.id}`);
      }

      // garante que aprovadoPor é array
      const aprovadores = Array.isArray(req.body.aprovadoPor)
        ? req.body.aprovadoPor
        : req.body.aprovadoPor
        ? [req.body.aprovadoPor]
        : [];

      const documento = await Documento.findById(documentoId);

      const ficheiros = await Promise.all(
        req.files.map(async (file, idx) => {
          const aprovadoPor = (aprovadores[idx] || "").trim();

          const ficheiro = new Ficheiro({
            nomeOriginal: file.originalname,
            path: file.filename,
            mimetype: file.mimetype,
            size: file.size,
            documento: documentoId,
            aprovadoPor,
            aprovadoEm: aprovadoPor ? new Date() : undefined,
            owner: userId,
          });

          await ficheiro.save();

          // 🔹 Log por arquivo
          await Log.create({
          usuarioId: userId,
          empresaId: req.session.user.empresaId || userId,
          usuarioNome,
          acao: "Upload de arquivo",
          modulo: "Documentos Gerais",
          nomeDocumento: documento ? documento.nome : `Pasta ${documentoId}`,
          nomeArquivo: file.originalname,
          aprovadoPor: ficheiro.aprovadoPor || "Não informado",
          });

          return ficheiro._id;
        })
      );

      await Documento.findByIdAndUpdate(documentoId, {
        $push: { ficheiros: { $each: ficheiros } },
        $set: {
          ultimaAlteracao: new Date(),
          alteradoPor: userId,
          alteradoPorModel,
        },
      });

      req.flash("success", "Arquivos enviados com sucesso!");
      return res.redirect(`/documentos/${documentoId}`);
    } catch (e) {
      console.error("🔥 Erro no upload:", e);
      req.flash("errors", ["Erro ao salvar os arquivos."]);
      return res.redirect(`/documentos/${req.params.id}`);
    }
  });
};


// ===============================
// APAGAR UM FICHEIRO
// ===============================
exports.apagarFicheiro = async (req, res) => {
  try {
    const { id, fileId } = req.params;
    const userId = String(req.session?.user?._id);
    const usuarioNome = req.session.user.user;
    const alteradoPorModel = req.session.user.role === "funcionario" ? "Funcionario" : "Cadastro";

    const ficheiro = await Ficheiro.findById(fileId);
    if (!ficheiro) {
      req.flash("errors", "Arquivo não encontrado.");
      return req.session.save(() => res.redirect(`/documentos/${id}`));
    }

    if (String(ficheiro.documento) !== String(id)) {
      req.flash("errors", "Este arquivo não pertence a esta pasta.");
      return req.session.save(() => res.redirect(`/documentos/${id}`));
    }

    const documento = await Documento.findById(id).select("owner empresaId nome");
    if (!documento) {
      req.flash("errors", "Pasta não encontrada.");
      return req.session.save(() => res.redirect("/documentos"));
    }

    const podeApagar =
      String(ficheiro.owner) === String(userId) || String(documento.owner) === String(req.session.user.empresaId);

    if (!podeApagar) {
      req.flash("errors", "Você não tem permissão para apagar este arquivo.");
      return req.session.save(() => res.redirect(`/documentos/${id}`));
    }

    // Apaga do disco
    const filePath = path.resolve("public", "uploads", ficheiro.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove do Mongo
    await ficheiro.deleteOne();

    await Documento.findByIdAndUpdate(id, {
      $pull: { ficheiros: ficheiro._id },
      $set: {
        ultimaAlteracao: new Date(),
        alteradoPor: userId,
        alteradoPorModel,
      },
    });

    // 🔹 Log da exclusão
    await Log.create({
      usuarioId: userId,
      empresaId: req.session.user.empresaId || userId,
      usuarioNome,
      acao: "Excluiu arquivo",
      modulo: "Documentos Gerais",
      nomeDocumento: documento ? documento.nome : `Pasta ${id}`,
      nomeArquivo: ficheiro.nomeOriginal,
    });

    req.flash("success", "Arquivo apagado com sucesso!");
    return req.session.save(() => res.redirect(`/documentos/${id}`));
  } catch (e) {
    console.error("[APAGAR] erro:", e);
    req.flash("errors", "Erro ao apagar o arquivo.");
    return req.session.save(() => res.redirect(`/documentos/${req.params.id}`));
  }
};


const Documento = require("../Schemas/documentoSchema");
const Ficheiro = require("../Schemas/fileSchema");
const multer = require("../config/multerConfig");
const fs = require("fs");
const path = require("path");
const Log = require("../Schemas/logSchema");

// ======================================================
// UPLOAD DE FICHEIROS (com nomePersonalizado + aprovadoPor)
// ======================================================
exports.uploadFicheiro = (req, res) => {
  // ✅ Usa fields() para aceitar arquivos + inputs de texto
  const uploadHandler = multer.fields([
    { name: "ficheiros", maxCount: 10 },
    { name: "nomesPersonalizados[]", maxCount: 10 },
    { name: "aprovadoPor[]", maxCount: 10 },
  ]);

  uploadHandler(req, res, async (err) => {
    if (err) {
      console.error("❌ Erro do Multer:", err);
      req.flash("errors", [err.message]);
      return res.redirect(`/documentos/${req.params.id}`);
    }

    try {
      const documentoId = req.params.id;
      const user = req.session.user;
      const userId = String(user?._id);
      const usuarioNome = user?.user || "Desconhecido";
      const alteradoPorModel = user?.role === "funcionario" ? "Funcionario" : "Cadastro";

      // ✅ Captura corretamente os arquivos (em array)
      const uploadedFiles = req.files?.ficheiros || [];

      if (!uploadedFiles.length) {
        req.flash("errors", "Nenhum arquivo enviado.");
        return res.redirect(`/documentos/${documentoId}`);
      }

      // ✅ Captura campos de texto corretamente
      const nomesPersonalizados = Array.isArray(req.body["nomesPersonalizados[]"])
        ? req.body["nomesPersonalizados[]"]
        : Array.isArray(req.body.nomesPersonalizados)
        ? req.body.nomesPersonalizados
        : req.body.nomesPersonalizados
        ? [req.body.nomesPersonalizados]
        : [];

      const aprovadores = Array.isArray(req.body["aprovadoPor[]"])
        ? req.body["aprovadoPor[]"]
        : Array.isArray(req.body.aprovadoPor)
        ? req.body.aprovadoPor
        : req.body.aprovadoPor
        ? [req.body.aprovadoPor]
        : [];

      const documento = await Documento.findById(documentoId);
      if (!documento) {
        req.flash("errors", "Pasta não encontrada.");
        return res.redirect("/documentos");
      }

      // ======================================================
      // 🔹 Cria e salva cada arquivo com seus metadados
      // ======================================================
      const ficheiros = await Promise.all(
        uploadedFiles.map(async (file, idx) => {
          const nomePersonalizado =
            (nomesPersonalizados[idx] || "").trim() || file.originalname;
          const aprovadoPor = (aprovadores[idx] || "").trim();

          const ficheiro = new Ficheiro({
            nomeOriginal: file.originalname,
            nomePersonalizado, // ✅ nome customizado
            path: file.filename,
            mimetype: file.mimetype,
            size: file.size,
            documento: documentoId,
            aprovadoPor,
            aprovadoEm: aprovadoPor ? new Date() : undefined,
            owner: userId,
          });

          await ficheiro.save();

          // 🔹 Cria log individual
          await Log.create({
            usuarioId: userId,
            empresaId: user.empresaId || userId,
            usuarioNome,
            acao: "Upload de arquivo",
            modulo: "Documentos Gerais",
            nomeDocumento: documento.nome || `Pasta ${documentoId}`,
            nomeArquivo: nomePersonalizado,
            aprovadoPor: aprovadoPor || "Não informado",
          });

          return ficheiro._id;
        })
      );

      // ======================================================
      // 🔹 Atualiza Documento principal
      // ======================================================
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

// ======================================================
// APAGAR UM FICHEIRO
// ======================================================
exports.apagarFicheiro = async (req, res) => {
  try {
    const { id, fileId } = req.params;
    const user = req.session.user;
    const userId = String(user?._id);
    const usuarioNome = user?.user || "Desconhecido";
    const alteradoPorModel = user?.role === "funcionario" ? "Funcionario" : "Cadastro";

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
      String(ficheiro.owner) === String(userId) ||
      String(documento.owner) === String(user.empresaId);

    if (!podeApagar) {
      req.flash("errors", "Você não tem permissão para apagar este arquivo.");
      return req.session.save(() => res.redirect(`/documentos/${id}`));
    }

    // 🔹 Remove arquivo físico
    const filePath = path.resolve("public", "uploads", ficheiro.path);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    // 🔹 Remove do banco
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
      empresaId: user.empresaId || userId,
      usuarioNome,
      acao: "Excluiu arquivo",
      modulo: "Documentos Gerais",
      nomeDocumento: documento?.nome || `Pasta ${id}`,
      nomeArquivo: ficheiro.nomePersonalizado || ficheiro.nomeOriginal,
    });

    req.flash("success", "Arquivo apagado com sucesso!");
    return req.session.save(() => res.redirect(`/documentos/${id}`));
  } catch (e) {
    console.error("[APAGAR] erro:", e);
    req.flash("errors", "Erro ao apagar o arquivo.");
    return req.session.save(() => res.redirect(`/documentos/${req.params.id}`));
  }
};

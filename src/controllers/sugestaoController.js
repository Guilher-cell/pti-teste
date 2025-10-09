// src/controllers/sugestaoController.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // e-mail FlowCerti
    pass: process.env.EMAIL_PASS,
  },
});

// Página inicial (formulário)
exports.index = (req, res) => {
  res.render("propor_sugestao", {
    user: req.session.user,
    csrfToken: req.csrfToken(),
    messages: {
      errors: req.flash("errors"),
      success: req.flash("success"),
    },
  });
};

// Enviar sugestão por e-mail
exports.enviar = async (req, res) => {
  try {
    const { titulo, descricao } = req.body;
    if (!titulo || !descricao) {
      req.flash("errors", "Preencha todos os campos obrigatórios.");
      return res.redirect("/sugestoes");
    }

    // envia para e-mail da empresa
    await transporter.sendMail({
      from: `"FlowCerti" <${process.env.EMAIL_USER}>`,
      to: "flowcerti@gmail.com", // 📌 troque pelo e-mail da empresa
      subject: `Nova sugestão recebida: ${titulo}`,
      html: `
        <h3>Nova sugestão enviada:</h3>
        <p><strong>Título:</strong> ${titulo}</p>
        <p><strong>Descrição:</strong> ${descricao}</p>
        ${
          req.session.user
            ? `<p><strong>Enviado por:</strong> ${req.session.user.user} (${req.session.user.email})</p>`
            : `<p><em>Usuário não logado</em></p>`
        }
      `,
    });

    // resposta para o usuário
    req.flash("success", "Sugestão enviada com sucesso!");
    return res.redirect("/sugestoes");
  } catch (err) {
    console.error("❌ Erro ao enviar sugestão:", err);
    req.flash("errors", "Não foi possível enviar sua sugestão.");
    return res.redirect("/sugestoes");
  }
};

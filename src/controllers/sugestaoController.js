const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS,
  },
});


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


exports.enviar = async (req, res) => {
  try {
    const { titulo, descricao } = req.body;
    if (!titulo || !descricao) {
      req.flash("errors", "Preencha todos os campos obrigatórios.");
      return res.redirect("/sugestoes");
    }

   
    await transporter.sendMail({
      from: `"FlowCerti" <${process.env.EMAIL_USER}>`,
      to: "flowcerti@gmail.com", 
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

    
    req.flash("success", "Sugestão enviada com sucesso!");
    return res.redirect("/sugestoes");
  } catch (err) {
    console.error("Erro ao enviar sugestão:", err);
    req.flash("errors", "Não foi possível enviar sua sugestão.");
    return res.redirect("/sugestoes");
  }
};

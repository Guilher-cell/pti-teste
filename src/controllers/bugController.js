const nodemailer = require('nodemailer');

// Configura Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // seu email
    pass: process.env.EMAIL_PASS  // senha de app do Gmail
  }
});

// Página inicial
exports.index = async (req, res) => {
  try {
    res.render('relatar_bug', {
      user: req.session.user,
      csrfToken: req.csrfToken(),
    });
  } catch (err) {
    console.error("Erro ao carregar página de bugs:", err);
    req.flash('error', 'Não foi possível carregar a página.');
    res.redirect('/');
  }
};

// Enviar novo bug por e-mail
exports.salvarBug = async (req, res) => {
  try {
    const { titulo, descricao } = req.body;

    if (!titulo || !descricao) {
      req.flash('error', 'Preencha todos os campos obrigatórios.');
      return res.redirect('/bugs');
    }

    // monta e envia o email para sua caixa
    await transporter.sendMail({
      from: `"FlowCerti - Reportar Bug" <${process.env.EMAIL_USER}>`,
      to: "flowcerti@gmail.com", // email que recebe
      subject: `Novo bug reportado: ${titulo}`,
      html: `
        <h3>Um bug foi relatado</h3>
        <p><strong>Título:</strong> ${titulo}</p>
        <p><strong>Descrição:</strong> ${descricao}</p>
        <p><strong>Usuário:</strong> ${req.session.user ? req.session.user.user : "Não autenticado"}</p>
      `
    });

    req.flash('success', 'Bug relatado com sucesso! Nossa equipe foi notificada por e-mail.');
    res.redirect('/bugs');
  } catch (err) {
    console.error("❌ Erro ao enviar bug:", err);
    req.flash('error', 'Erro ao enviar bug. Tente novamente.');
    res.redirect('/bugs');
  }
};

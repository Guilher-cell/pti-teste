// Em: src/utils/email.js
const nodemailer = require('nodemailer');

const sendEmail = async options => {
  let transporter;

  // Se estivermos em ambiente de desenvolvimento, usamos o Ethereal.
  if (process.env.NODE_ENV === 'development') {
    // Gera uma conta de teste no Ethereal
    const testAccount = await nodemailer.createTestAccount();
    console.log('========================================================');
    console.log('ETHEREAL - CONTA DE TESTE CRIADA:');
    console.log(`User: ${testAccount.user}`);
    console.log(`Pass: ${testAccount.pass}`);
    console.log('========================================================');

    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // Utilizador de teste gerado
        pass: testAccount.pass, // Senha de teste gerada
      },
    });
  } else {
    // Em produção, usamos as credenciais do .env (Brevo, etc.)
    transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  // Opções do e-mail
  const mailOptions = {
    from: 'FlowCerti <noreply@flowcerti.com>', // Em desenvolvimento, o remetente não importa
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // Enviar o e-mail
  const info = await transporter.sendMail(mailOptions);

  // Se usámos o Ethereal, imprime o link para ver o e-mail
  if (process.env.NODE_ENV === 'development') {
    console.log('========================================================');
    console.log('E-MAIL ENVIADO (MODO DE TESTE)!');
    console.log('URL para pré-visualização: %s', nodemailer.getTestMessageUrl(info));
    console.log('========================================================');
  }
};

module.exports = sendEmail;

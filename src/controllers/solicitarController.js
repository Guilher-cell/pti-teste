const Solicitacao = require('../models/solicitacaoModel');
const sendEmail = require('../utils/email'); 

exports.index = (req, res) => {
    res.render('solicitarDemo'); 
};

exports.enviar = async (req, res) => {
    try {
        const solicitacao = new Solicitacao(req.body);
        solicitacao.valida();
        if (solicitacao.errors.length > 0) {
            req.flash('errors', solicitacao.errors);
            return req.session.save(() => res.redirect('/solicitar-demonstracao'));
        }
        const { nomeResponsavel, razaoSocial, email, cnpj, ramoEmpresa, mensagem } = solicitacao.body;
        
        const emailSubject = `Nova Solicitação de Demonstração: ${razaoSocial}`;
        const emailBody = `
            Uma nova solicitação de demonstração foi recebida.

            Detalhes do Lead:
            ---------------------------------
            Nome do Responsável: ${nomeResponsavel}
            Razão Social: ${razaoSocial}
            E-mail de Contato: ${email}
            CNPJ: ${cnpj}
            Ramo da Empresa: ${ramoEmpresa}
            ---------------------------------

            Mensagem Adicional:
            ${mensagem || 'Nenhuma mensagem adicional fornecida.'}
        `;
        await sendEmail({
            email: 'flowcerti@gmail.com', 
            subject: emailSubject,
            message: emailBody
        });

        req.flash('success', 'Sua solicitação foi enviada com sucesso! Entraremos em contato em breve.');
        return req.session.save(() => res.redirect('/solicitar-demonstracao'));

    } catch (e) {
        console.log('ERRO AO ENVIAR SOLICITAÇÃO:', e);
        req.flash('errors', 'Ocorreu um erro no sistema ao tentar enviar sua solicitação. Tente novamente.');
        return req.session.save(() => res.redirect('/solicitar-demonstracao'));
    }
};

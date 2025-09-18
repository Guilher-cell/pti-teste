const Login = require('../models/loginModel'); 
exports.index = (req, res) => {
   
    if (req.session.user) return res.redirect('/'); 
    res.render('login');
};

exports.login = async function(req, res) {
    try {
        // 1. Cria uma instância da sua classe Login
        const login = new Login(req.body);
        
        // 2. Executa o método .login() (que agora usa argon2 internamente)
        await login.login();

        // 3. Verifica se a classe Login encontrou erros
        if (login.errors.length > 0) {
            req.flash('errors', login.errors);
            return req.session.save(() => res.redirect('/login'));
        }

        // 4. Se tudo correu bem, define a sessão e redireciona
        req.flash('success', 'Login realizado com sucesso!');
        req.session.user = login.user; // O utilizador encontrado é guardado na sessão
        return req.session.save(() => res.redirect('/'));

    } catch (e) {
        console.error('--- ERRO CRÍTICO NO LOGIN CONTROLLER ---');
        console.error(e);
        req.flash('errors', 'Ocorreu um erro interno no sistema.');
        return req.session.save(() => res.redirect('/login'));
    }
};

exports.logout = function(req, res) {
    req.session.destroy();
    res.redirect('/');
};

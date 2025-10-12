const express = require('express');
const route = express.Router();
const middleware = require('./src/middlewares/middleware');
const permissao = require('./src/middlewares/permissao');
// Controllers
const loginController = require('./src/controllers/loginController');
const cadastroController = require('./src/controllers/cadastroController');
const passwordController = require('./src/controllers/passwordController');
const homeController = require('./src/controllers/homeController');
const sobreController = require('./src/controllers/sobreController');
const planosController = require('./src/controllers/planosController');
const funcionalidadeController = require('./src/controllers/funcionalidadesController');
const documentosController = require('./src/controllers/documentoController');
const esqueciSenhaController = require('./src/controllers/esqueciSenhaController');
const solicitarController = require('./src/controllers/solicitarController');
const fileController = require('./src/controllers/fileController');
const accountController = require('./src/controllers/accountController');
const resumeController = require('./src/controllers/resumeController');
const myDataController = require('./src/controllers/myDataController');
const verificationController = require('./src/controllers/verificationController');
const securityController = require('./src/controllers/securityController');
const paymentController = require('./src/controllers/pagamentoUsuarioController');
const funcionarioController = require('./src/controllers/funcionarioController');
const twoFaController = require('./src/controllers/twoFaController');
const dashboardController = require('./src/controllers/dashboardController');
const gerenciarIsoController = require('./src/controllers/gerenciarIsoController');
const iso9001Controller = require("./src/controllers/iso9001Controller");
const logController = require("./src/controllers/logController");
const centralAjudaController = require("./src/controllers/centralAjudaController");
const planoPremiumController = require("./src/controllers/planoPremiumController");
const pagamentoController = require("./src/controllers/pagamentoController");
const sugestaoController = require("./src/controllers/sugestaoController");
const bugController = require("./src/controllers/bugController");
const blogController = require('./src/controllers/blogController');
const blog1Controller = require('./src/controllers/blog1Controller');
const blog2Controller = require('./src/controllers/blog2Controller');
const blog3Controller = require('./src/controllers/blog3Controller');
const blog4Controller = require('./src/controllers/blog4Controller');
const termoController = require('./src/controllers/termoController');
const politicaController = require('./src/controllers/politicaController');
// =======================
// ROTAS GET
// =======================
route.get('/', homeController.index);
route.get('/login', loginController.index);
route.get('/criar', cadastroController.criar);
route.get('/verificar-email/:token', cadastroController.verificarEmail);
route.get('/esqueci', esqueciSenhaController.esqueci);
route.get('/sobre', sobreController.sobre);
route.get('/planos', planosController.planos);
route.get('/funcionalidades', funcionalidadeController.funcionalidade);
route.get('/resumo', middleware.isAuthenticated, resumeController.index);
route.get('/meus-dados', middleware.isAuthenticated, myDataController.index);
route.get('/verificacao', middleware.isAuthenticated, verificationController.index);
route.get('/seguranca', middleware.isAuthenticated, securityController.index);
route.get('/pagamento', middleware.isAuthenticated, paymentController.index);
route.get('/cadastrar-funcionario', middleware.isAuthenticated, funcionarioController.index);
route.get('/minha-conta', middleware.isAuthenticated, accountController.index);
route.get("/documentos", permissao("documentosGerais"), documentosController.index);
route.get('/documentos/:id', middleware.isAuthenticated, documentosController.detalhe);
route.get('/solicitar', solicitarController.index);
route.get('/esqueci-senha', passwordController.forgotPasswordPage);
route.get('/redefinir-senha/:token', passwordController.resetPasswordPage);
route.get('/dashboard', permissao("dashboardISO"), dashboardController.index);
route.get('/gerenciar',middleware.isAuthenticated, gerenciarIsoController.index)
route.get("/iso9001/:capitulo",middleware.isAuthenticated, permissao("dashboardISO"), iso9001Controller.mostrarCapitulo);
route.get("/logs/empresa", middleware.isAuthenticated, logController.logsEmpresa);
route.get("/logs/admin", middleware.isAuthenticated, middleware.isAdmin, logController.logsAdmin);
route.get("/central_ajuda", middleware.isAuthenticated, centralAjudaController.index )
route.get("/plano_premium", middleware.isAuthenticated , planoPremiumController.index)
route.get("/pagamento/:plano", pagamentoController.criarPagamento);
route.get("/pagamento/sucesso",  pagamentoController.sucesso);
route.get("/pagamento/erro",     pagamentoController.erro);
route.get("/pagamento/pendente", pagamentoController.pendente);
route.get("/bugs", middleware.isAuthenticated, bugController.index)
route.get('/sugestoes', middleware.isAuthenticated, sugestaoController.index);
route.get('/blog', blogController.index);
route.get('/blog1', blog1Controller.index);
route.get('/blog2', blog2Controller.index);
route.get('/blog3', blog3Controller.index);
route.get('/blog4', blog4Controller.index);
route.get('/termo', termoController.index);
route.get('/politica', politicaController.index);

route.get("/api/cep/:cep", middleware.isAuthenticated, async (req, res) => {
  try {
    const cep = req.params.cep;
    const response = await fetch(`http://viacep.com.br/ws/${cep}/json/`);
    if (!response.ok) {
      throw new Error("Erro no ViaCEP");
    }
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Erro ao consultar ViaCEP:", err);
    res.status(500).json({ error: "Erro ao consultar CEP" });
  }
});

// ========== 2FA ==========
// Ativação da 2FA (usuário logado)
route.get('/seguranca/ativar-2fa', middleware.isAuthenticated, (req, res) => {
  res.render('ativar2fa', { csrfToken: req.csrfToken() });
});

// Login com 2FA
route.get('/login/2fa', loginController.login2FA);

// =======================
// ROTAS POST
// =======================
route.post('/', homeController.index);
route.post('/login', loginController.login);
route.post('/login/2fa', loginController.confirm2FA); // Confirma login 2FA
route.post('/login/register', cadastroController.register);
route.post('/logout', middleware.isAuthenticated, loginController.logout);
route.post('/redefinir-senha/:token', passwordController.updatePassword);
route.post('/solicitar-demonstracao', solicitarController.enviar);
route.post('/esqueci-senha', passwordController.sendResetToken);
route.post('/documentos/criar', middleware.isAuthenticated,documentosController.criar);
route.post('/documentos/editar/:id', middleware.isAuthenticated, documentosController.editar);
route.post('/documentos/apagar/:id', middleware.isAuthenticated, documentosController.apagar);
route.post('/documentos/:id/upload', middleware.isAuthenticated,fileController.uploadFicheiro);
route.post('/documentos/:id/ficheiro/:fileId/apagar', middleware.isAuthenticated,fileController.apagarFicheiro);
route.post("/documentos/:id/ficheiro/:fileId/aprovar",middleware.isAuthenticated,documentosController.aprovarFicheiro);
route.post('/funcionarios/adicionar', middleware.isAuthenticated, funcionarioController.salvar);
route.post('/funcionarios/:id/atualizar', middleware.isAuthenticated, funcionarioController.atualizar);
route.post('/funcionarios/:id/remover',   middleware.isAuthenticated, funcionarioController.remover);
route.post('/meus-dados/salvar', middleware.isAuthenticated, myDataController.salvar)
route.post('/minha-conta/alterar-senha', middleware.isAuthenticated, accountController.alterarSenha);
route.post("/iso9001/:capitulo/upload", middleware.isAuthenticated, permissao("dashboardISO"),iso9001Controller.uploadCapitulo);
route.post("/iso9001/:capitulo/ficheiro/:fileId/apagar", middleware.isAuthenticated, permissao("dashboardISO"), iso9001Controller.apagarFicheiroCapitulo);
route.post("/iso9001/:capitulo/checklist", middleware.isAuthenticated, permissao("dashboardISO"), iso9001Controller.salvarChecklist);
route.post('/minha-conta/alterar-senha', passwordController.updatePasswordLogged);
route.post('/bugs/novo', bugController.salvarBug);
route.post('/sugestoes/nova', sugestaoController.enviar);

// ========== 2FA ==========
// Ativação (usuário logado)
route.post('/seguranca/2fa/enviar', middleware.isAuthenticated, twoFaController.habilitar2FA);
route.post('/seguranca/2fa/confirmar', middleware.isAuthenticated, twoFaController.confirmarAtivacao);



module.exports = route;

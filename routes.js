const express= require('express')
const route= express.Router()
const middleware = require('./src/middlewares/middleware')
const loginController= require('./src/controllers/loginController')
const cadastroController= require('./src/controllers/cadastroController')
const passwordController = require('./src/controllers/passwordController');
const homeController = require('./src/controllers/homeController')
const sobreController = require('./src/controllers/sobreController')
const planosController = require('./src/controllers/planosController')
const funcionalidadeController = require('./src/controllers/funcionalidadesController')
const documentosController = require('./src/controllers/documentoController')
const esqueciSenhaController = require('./src/controllers/esqueciSenhaController')
const solicitarController = require('./src/controllers/solicitarController')
const arquivoController = require('./src/controllers/arquivoController')


//Rotas get:
route.get('/', homeController.index)
route.get('/login', loginController.index)
route.get('/logout', loginController.logout);
route.get('/criar', cadastroController.criar)
route.get('/esqueci', esqueciSenhaController.esqueci)
route.get('/sobre', sobreController.sobre)
route.get('/planos', planosController.planos)
route.get('/funcionalidades', funcionalidadeController.funcionalidade)
route.get('/documentos', middleware.isAuthenticated, documentosController.index)
route.get('/solicitar', solicitarController.index)
route.get('/solicitar-demonstracao', solicitarController.index)
route.get('/esqueci-senha', passwordController.forgotPasswordPage); 
route.get('/redefinir-senha/:token', passwordController.resetPasswordPage); 
route.get('/documentos/:id', middleware.isAuthenticated, documentosController.detalhe)

//Rotas post:
route.post('/',homeController.index)
route.post('/login', loginController.login)
route.post('/login/register', cadastroController.register)
route.post('/redefinir-senha/:token', passwordController.updatePassword); 
route.post('/solicitar-demonstracao', solicitarController.enviar)
route.post('/esqueci-senha', passwordController.sendResetToken); 
route.post('/documentos/criar', middleware.isAuthenticated, documentosController.criar);
route.post('/documentos/editar/:id', middleware.isAuthenticated, documentosController.editar);
route.post('/documentos/apagar/:id', middleware.isAuthenticated, documentosController.apagar);


route.post('/documentos/:id/upload', middleware.isAuthenticated, arquivoController.uploadFicheiro);
route.delete('/documentos/:id/file/:fileId', middleware.isAuthenticated, arquivoController.apagarFicheiro);


module.exports = route;

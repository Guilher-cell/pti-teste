const { cnpj } = require('cpf-cnpj-validator');
const validator = require('validator');

class Solicitacao {
    constructor(body) {
        this.body = body;
        this.errors = [];
    }
    valida() {
        this.cleanUp();
        if (!this.body.nomeResponsavel) 
        this.errors.push('O nome do responsável é obrigatório.');
        if (!this.body.razaoSocial) 
        this.errors.push('A razão social é obrigatória.');
        if (!validator.isEmail(this.body.email)) 
        this.errors.push('E-mail inválido.');
        if (!cnpj.isValid(this.body.cnpj)) 
        this.errors.push('CNPJ inválido.');
        if (!this.body.ramoEmpresa) 
        this.errors.push('O ramo da empresa é obrigatório.');
    }
    cleanUp() {
        for (const key in this.body) {
            if (typeof this.body[key] !== 'string') {
                this.body[key] = '';
            }
        }
    }
}

module.exports = Solicitacao;

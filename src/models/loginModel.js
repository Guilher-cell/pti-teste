const cadastroModel = require('../Schemas/cadastroSchema');


class Login {
  constructor(body) {
   this.body=body
   this.errors=[]
   this.user=null
  }

  async login() {
    this.cleanUp()
    this.validaLogin()
    if (this.errors.length > 0) return

    this.user = await cadastroModel.findOne({ user: this.body.user }).select('+password')

    if (!this.user) {
      this.errors.push('Usuário não existe')
      return
    }

    const passwordIsValid = await this.user.isCorrectPassword(this.body.password)
    if (!passwordIsValid) {
        this.errors.push('Senha inválida');
        this.user = null; 
        return;
    }
  }

  validaLogin() {
    if (!this.body.user) {
      this.errors.push('Usuário é obrigatório')
    }
    if (!this.body.password) {
      this.errors.push('Senha é obrigatória')
    }
  }

  cleanUp() {
    for (const key in this.body) {
      if (typeof this.body[key] !== 'string') {
       this.body[key] = ''
      }
    }
    this.body = {
      user:this.body.user,
      password:this.body.password
    }
  }
}

module.exports = Login

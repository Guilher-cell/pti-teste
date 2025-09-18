const validator = require('validator')
const mongoose = require('mongoose');
const {cnpj} = require('cpf-cnpj-validator')
const cadastroModel = require('../Schemas/cadastroSchema')

class Cadastro {
 constructor(body){
  this.body = body
  this.errors = []
  this.user = null
 }

async register(){
  this.valida()
  if(this.errors.length > 0) return

  await this.Exists()
  if(this.errors.length > 0) return
  this.user = await cadastroModel.create(this.body);

 }

 async Exists(){
  const emailExists = await cadastroModel.findOne({ email:this.body.email})
  const userExists = await cadastroModel.findOne({ user:this.body.user})
  const cnpjExists = await cadastroModel.findOne({ cnpj:this.body.cnpj})
  if(userExists)this.errors.push('Úsuario já está cadastrado')
  if(emailExists)this.errors.push('O email já está cadastrado')
  if(cnpjExists)this.errors.push('O cpnj já está cadastrado')
 }


 valida(){
  //validação de campos por ex: se as senhas batem
  this.cleanUp()
  if(!validator.isEmail(this.body.email)){
    this.errors.push('E-mail inválido')
  }

  if(this.body.password.length < 8 || this.body.password.length >50 ){
    this.errors.push('A senha precisa ter entre 8 a 50 caracteres!')
  }
  
  if (!/[A-Z]/.test(this.body.password)) {
    this.errors.push('A senha precisa conter ao menos uma letra maiúscula.')
  }

  if (!/[a-z]/.test(this.body.password)) {
    this.errors.push('A senha precisa conter ao menos uma letra minúscula.')
  }

  if (!/[0-9]/.test(this.body.password)) {
    this.errors.push('A senha precisa conter ao menos um número.')
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(this.body.password)) {
    this.errors.push('A senha precisa conter ao menos um caractere especial.')
  }

  if(this.body.password !== this.body.passwordConfirm){
    this.errors.push('As senhas não coincidem')
  }

  if (!cnpj.isValid(this.body.cnpj)){
    this.errors.push('CNPJ inválido')
  }
 }

 cleanUp(){
  for(const key in this.body){
    if(typeof this.body[key] !== 'string'){
      this.body[key] = ''
    }
  }

  this.body = {
    email: this.body.email,
    password: this.body.password,
    passwordConfirm: this.body.passwordConfirm,
    user : this.body.user,
    cnpj : this.body.cnpj
  }
 }
  
  
}
module.exports = Cadastro;

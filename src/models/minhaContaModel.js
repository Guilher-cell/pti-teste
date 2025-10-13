class PasswordValidator {
  constructor(password, passwordConfirm) {
    this.password = password;
    this.passwordConfirm = passwordConfirm;
    this.errors = [];
  }

  valida() {
    if (!this.password || !this.passwordConfirm) {
      this.errors.push('Preencha todos os campos.');
      return;
    }

    if (this.password !== this.passwordConfirm) {
      this.errors.push('As senhas não coincidem.');
    }

    if (this.password.length < 8 || this.password.length > 50) {
      this.errors.push('A senha precisa ter entre 8 e 50 caracteres.');
    }

    if (!/[A-Z]/.test(this.password)) {
      this.errors.push('A senha precisa conter ao menos uma letra maiúscula.');
    }

    if (!/[a-z]/.test(this.password)) {
      this.errors.push('A senha precisa conter ao menos uma letra minúscula.');
    }

    if (!/[0-9]/.test(this.password)) {
      this.errors.push('A senha precisa conter ao menos um número.');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(this.password)) {
      this.errors.push('A senha precisa conter ao menos um caractere especial.');
    }
  }
}

module.exports = PasswordValidator;

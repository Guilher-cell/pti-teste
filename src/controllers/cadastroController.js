const Cadastro = require('../models/cadastroModel')

exports.criar = (req,res)=>{
    res.render('cadastro')
}

exports.register = async function(req,res) {
    try{
    const cadastro = new Cadastro(req.body)
    await cadastro.register()

    if(cadastro.errors.length > 0){
     req.flash('errors', cadastro.errors)   
     req.session.save(function(){ 
        return res.redirect('/criar')
     })
     return
    }

     req.flash('success', 'Seu usuário foi criado com sucesso.')   
     req.session.save(function(){ 
        return res.redirect('/criar')
    })
    } catch(e){
        console.log(e);
       return res.render('404')
    }
}





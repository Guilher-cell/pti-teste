exports.middlewareGlobal = (req, res, next) => {
  res.locals.errors = req.flash('errors')
  res.locals.success = req.flash('success')
  res.locals.user = req.session.user 
  next()
}

exports.checkCsrfError = (err, req, res, next) => {
  if(err) {
    return res.render('404')
  }
  next()
}

exports.csrfMiddleware = (req, res, next) => {
  if (typeof req.csrfToken === "function") {
    res.locals.csrfToken = req.csrfToken();
  } else {
    res.locals.csrfToken = null;
  }
  next();
}

exports.isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  req.flash("errors", "Você precisa estar logado para acessar essa página.");
  res.redirect("/login");
}



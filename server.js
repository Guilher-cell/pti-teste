require('dotenv').config()
const express = require('express')
const app = express()
const mongoose = require('mongoose')
mongoose.connect(process.env.CONNECTIONSTRING)
  .then(() => {
    app.emit('pronto')
  })
  .catch(e => console.log(e))
const session = require('express-session')
const MongoStore = require('connect-mongo')
const flash = require('connect-flash')
const routes = require('./routes')
const path = require('path')
const helmet = require('helmet')
const csrf = require('csurf')
const { middlewareGlobal, checkCsrfError, csrfMiddleware } = require('./src/middlewares/middleware')


const { v2: cloudinary } = require('cloudinary');
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'", // libera inline
          "https://upload-widget.cloudinary.com",
          "https://res.cloudinary.com", // Adicionado para scripts do Cloudinary, se houver
          "https://api.cloudinary.com" // Adicionado para a API do Cloudinary
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
          "https://res.cloudinary.com" // Adicionado para estilos do Cloudinary, se houver
        ],
        fontSrc: [
          "'self'",
          "https://fonts.gstatic.com"
        ],
        imgSrc: [
          "'self'",
          "data:",
          "https://res.cloudinary.com"
        ],
        connectSrc: [
          "'self'",
          "https://api.cloudinary.com",
          "https://upload-widget.cloudinary.com"
        ],
      },
    },
  } )
);

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.static(path.resolve(__dirname, 'public')))
app.use('/uploads', express.static(path.resolve(__dirname, 'public', 'uploads')))

const sessionOptions = session({
  secret: 'akasdfj0út23453456+54qt23qv  qwf qwer qwer qewr asdasdasda a6()',
  store: MongoStore.create({ mongoUrl: process.env.CONNECTIONSTRING}),
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true
  }
} );
app.use(sessionOptions)
app.use(flash())

app.set('views', path.resolve(__dirname, 'src', 'views'));
app.set('view engine', 'ejs');

app.locals.env = process.env;


const csrfProtection = csrf();
app.use((req, res, next) => {
  if (req.path === "/upload") { 
    return next(); 
  }
  csrfProtection(req, res, next);
});

app.use(middlewareGlobal)
app.use(checkCsrfError)
app.use(csrfMiddleware)
app.use(routes)


app.on('pronto', () => {
  app.listen(4000, () => {
    console.log('Acessar http://localhost:4000' )
    console.log('Servidor executando na porta 4000')
  })
})
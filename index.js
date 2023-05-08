const express = require('express');
const app = express();
const exphbs = require('express-handlebars');
const cookieParser = require('cookie-parser');

// variable PORT finds port in process or defaults to 3000
const PORT = process.env.PORT || 3000 ;

// import dotenv for private key handling
require('dotenv').config();

// import handlebars for page rendering
app.engine('handlebars', exphbs.engine({ defaultLayout : false }));
app.set('view engine', 'handlebars');

app.use(express.static('public')); // Serves static files
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(cookieParser()); 
app.use('/register', require('./routes/register')); // imports register.js to handle all requests onephoto/register
app.use('/login', require('./routes/login')); // imports register.js to handle all requests onephoto/login
app.use('/welcome', require('./routes/welcome')); // imports register.js to handle all requests onephoto/welcome
app.use('/logout', require('./routes/logout')); // imports register.js to handle all requests onephoto/logout

// Redirects user to /register
app.get('/', (req, res) => {
    res.redirect('/register');
})

// Starts an http server listen on PORT
app.listen(PORT, () => console.log("listening on port ", PORT));
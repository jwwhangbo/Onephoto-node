const express = require('express');
const app = express();
const exphbs = require('express-handlebars');
const cookieParser = require('cookie-parser');

const PORT = process.env.PORT || 3000 ;

const seo = require("./src/seo.json");
if (seo.url === "glitch-default") {
  seo.url = `https://${process.env.PROJECT_DOMAIN}.glitch.me`;
}

require('dotenv').config();

app.engine('handlebars', exphbs.engine({ defaultLayout : false }));
app.set('view engine', 'handlebars');

app.use(express.static('public'));
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(cookieParser());
app.use('/register', require('./routes/register'));
app.use('/login', require('./routes/login'));
app.use('/welcome', require('./routes/welcome'));
app.use('/logout', require('./routes/logout'));

app.get('/', (req, res) => {
    res.redirect('/register');
})

app.listen(PORT, () => console.log("listening on port ", PORT));
const app = require('express');
const router = app.Router();
const _ = require('lodash');
const validation = require('../src/validation');
const path = require('path');
const user = require('../src/user');

var loginTemplate = {
    username : '',
    password : '',
    username_err : '',
    password_err : ''
}

function resetErrorMessages() {
    loginTemplate.username_err = '';
    loginTemplate.password_err = '';
}

router.get('/', (req, res) => {
    resetErrorMessages();
    res.render('login', {loginTemplate});
})

router.post('/', async (req, res) => {
    const { error, value } = validation.validateLogin(_.pick(req.body, ['username', 'password']));
    if (error) {
        switch (error.details[0].context.key) {
            case 'username' : 
                loginTemplate.username_err = error.message;
                loginTemplate.password_err = '';
                break;
            case 'password' :
                loginTemplate.password_err = error.message;
                loginTemplate.username_err = '';
                break;
        }
        res.render('login', {loginTemplate});
        return;
    }
    else {
        const new_user = new user(_.get(value,'username'), _.get(value,'password'));
        new_user.authenticate( async (err, result) => {
            if (err) {
                resetErrorMessages();
                loginTemplate.username_err = 'no user found';
                res.render('login', {loginTemplate});
                return;
            }
            if (result) {
                const token = await new_user.genToken();
                res.cookie('token',token, { httpOnly: true, maxAge: 3600000 });
                res.redirect('/welcome');
            }
            else res.status(401);
        });
    }
})

module.exports = router;
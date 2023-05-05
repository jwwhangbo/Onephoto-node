const express = require('express');
const router = express.Router();
const _ = require('lodash');
const validation = require('../src/validation');
const path = require("path");

// Import database functions 
const data = require('../src/data.json');
const db = require('../src/' + data.database);

// Values sent to handlebars to render the page
var registerErrorMsg = {
    username : '',
    password : '',
    confirm_password : '',
    username_err : '',
    password_err : '',
    confirm_password_err : '',
}

function resetErrorMessages () {
    registerErrorMsg.username_err = '';
    registerErrorMsg.password_err = '';
    registerErrorMsg.confirm_password_err = '';
}

router.get('/', (req, res) => {
    resetErrorMessages();
    res.render('register', {registerErrorMsg})
});

router.post('/', async (req, res) => {
    const { error, value } = validation.validateRegister(_.pick(req.body, ['username', 'password', 'confirm_password']));
    if (error) {
        switch (error.details[0].context.key) {
            case 'username' : 
                resetErrorMessages();
                registerErrorMsg.username_err = error.message;
                break;
            case 'password' :
                resetErrorMessages();
                registerErrorMsg.password_err = error.message;
                break;
            case 'confirm_password' :
                resetErrorMessages();
                registerErrorMsg.confirm_password_err = error.message;
                break;
        }
        res.render('register', {
            registerErrorMsg,
            username : req.body.username,
            password : req.body.password,
            confirm_password : req.body.confirm_password
        });
    }
    // Input Validation successful
    // query username for duplicates in database
    else {
        const query_result = await db.getUser(_.get(value,'username'));
        if (query_result) {
            resetErrorMessages();
            registerErrorMsg.username_err = 'this username is already taken';
            res.render('register', {
                registerErrorMsg,
                username : req.body.username,
                password : req.body.password,
                confirm_password : req.body.confirm_password
            });
            return;
        }
        else {
            const req_username = _.get(value, 'username');
            const req_password = _.get(value, 'password');
            try {
                await db.createUser(req_username, req_password);
            } catch (dbError) {
                res.status(501);
            }
            res.redirect('/login');
        };
    };
})

module.exports = router; 
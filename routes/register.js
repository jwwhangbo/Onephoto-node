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
    username_err : '',
    password_err : '',
    confirm_password_err : '',
}

function resetErrorMessages () {
    registerErrorMsg.username_err = '';
    registerErrorMsg.password_err = '';
    registerErrorMsg.confirm_password_err = '';
}

// renders registration page using values 
router.get('/', (req, res) => {
    resetErrorMessages();
    res.render('register', {registerErrorMsg})
});

router.post('/', async (req, res) => {
    // validates html body values
    // _.pick is a lodash function that filters all unnecesary body values from being processed on serverside
    const { error, value } = validation.validateRegister(_.pick(req.body, ['username', 'password', 'confirm_password']));
    if (error) {
        // error.details[0].context.key returns the custom error message from validation.js
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
        // Input validation was unsuccessful so we re-render the page using error messages
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
        // Search the database for matching username
        const query_result = await db.getUser(_.get(value,'username'));
        // there is already a username
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
            // push new user to the database
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
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

const data = require('./data.json');
const db = require('./' + data.database);

const token_exp = '1h';

class User{
    constructor(username, password) {
        this.username = username;
        this.password = password;
    }

    async authenticate(callback) {
        const userdata = await db.getUser(this.username);
        bcrypt.compare(this.password, _.get(userdata, 'PASSWORD'), function (err, result) {
            callback(err, result);
        })
    }

    async genToken() {
        const userdata = await db.getUser(this.username);
        return jwt.sign(_.pick(userdata, ['USERNAME', 'id']), process.env.JWT_KEY, {expiresIn : token_exp});
    }
}

module.exports = User
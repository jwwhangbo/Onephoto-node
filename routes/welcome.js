const app = require('express');
const auth = require('../middleware/auth');
const _ = require('lodash');
const router = app.Router();

router.get('/', auth, (req, res) => {
    res.render('welcome', {message : `You are logged in as user: ${_.get(req.user, 'USERNAME')}`});
})

module.exports = router;
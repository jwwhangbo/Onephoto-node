const app = require('express');
const router = app.Router();

router.get('/', (req, res) => {
    res.clearCookie('token');
    res.redirect('/register');
})

module.exports = router;
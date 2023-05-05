const jwt = require('jsonwebtoken');

function auth (req, res, next) {
    const token = req.cookies.token;
    if (!token) return res.status(401).send('access denied. No token provided');
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        req.user = decoded;
        next();
    }
    catch (ex) {
        res.status(400).send('Invalid Token');
    }
}

module.exports = auth;
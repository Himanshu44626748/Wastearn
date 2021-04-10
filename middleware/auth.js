const jwt = require('jsonwebtoken');
const user = require('../models/user');

const auth = async (req, res, next) => {
    try{
        const token = req.cookies.jwt;
        const verify = jwt.verify(token, process.env.SECRET_KEY);
        next();
    }
    catch(e)
    {
        res.status(401).send(e);
    }
}

module.exports = auth;
// import JSON web token
const jwt = require('jsonwebtoken');

const checkIfAuthenticated = (req, res, next) => {
    if (req.session.vendor) {
        next()
    } else {
        req.flash('error_messages', 'Please sign in to access the page')
        res.redirect('/auth/login')
    }
}


const checkIfAuthenticatedJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }

            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

module.exports = { checkIfAuthenticated, checkIfAuthenticatedJWT }
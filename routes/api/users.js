// =================================== IMPORTED =================================== 
// import express and express router
const express = require('express')
const router = express.Router()

// import model
const { User } = require('../../models')

// import crypto for password encryption
const crypto = require('crypto');
const getHashedPassword = (password) => {
    const sha256 = crypto.createHash('sha256');
    const hash = sha256.update(password).digest('base64');
    return hash;
}

// =================================== ROUTES =================================== 

// === [C] create user account ===
router.post('/create', async (req,res) => {
    try {
        // set data from req.body directly to database
        const user = new User();
        user.set('username', req.body.username)
        user.set('email', req.body.email)
        user.set('password', getHashedPassword(req.body.password))
        user.set('address', req.body.address)
        user.set('phone_number', req.body.phone_number)
        await user.save()
        
        res.status(200)
        res.send(user)
    } catch (e) {
        console.log(e)
        res.status(500)
        res.send('Unexpected internal server error')
    }
})


// === [] user login ===
// process login form
router.post('/login', async (req, res) => {

    try {
        // fetch user data
        const user = await User.where('email',req.body.email).fetch({
            require: false
        })

        // case 1 - email exist and password match. grant access token
        if (user && (user.get('password') == getHashedPassword(req.body.password))){
            res.send('log in successful')
        } else {
            // case 2 - email doesn't exist or password doesn't match
            res.send({
                'error': 'Invalid login details. Please try again.'
            })
        }
        
    } catch (e) {
        console.log(e)
        res.status(500)
        res.send('Unexpected internal server error')
    }
})


module.exports = router;


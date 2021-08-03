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

// import JSON web token
const jwt = require('jsonwebtoken');
const generateAccessToken = (user) => {
    return jwt.sign({
        'username': user.get('username'),
        'id': user.get('id'),
        'email': user.get('email')
    }, process.env.TOKEN_SECRET, {
        expiresIn: "1h"
    });
}

// import middleware
const {checkIfAuthenticatedJWT} = require('../../middlewares')


// =================================== ROUTES =================================== 

// === [C] create user account ===
router.post('/create', async (req,res) => {

    // case 1: user email already exist in db
    let user = await User.where({
        'email': req.body.email
    }).fetch({
        require: false
    });

    let emailExist = false

    if (user) {
        emailExist = true
        res.status(400)
        res.send('Email taken.')
    }

    // case 2: no existing user email in db
    if (!emailExist){
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
            let accessToken = generateAccessToken(user);
            res.send({
                accessToken
            })
        } else {
            // case 2 - email doesn't exist or password doesn't match
            res.status(401)
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


// [R] User profile page
router.get('/profile', checkIfAuthenticatedJWT, async (req,res) => {
    try {
        let user = await User.where('id', req.user.id).fetch({
            columns: ['username','id','email','address','phone_number']
        })
        res.send(user.toJSON())
        res.status(200)
    } catch (e) {
        console.log(e)
        res.status(500)
        res.send('Unexpected internal server error')
    }
})

// [U] Update user details
router.post('/profile/update', checkIfAuthenticatedJWT, async(req,res) => {
    
    try {
        let user = await User.where('id', req.user.id).fetch()

        user.set('username', req.body.username)
        user.set('email', req.body.email)
        user.set('address', req.body.address)
        user.set('phone_number', req.body.phone_number)
        await user.save()


        res.send(user.toJSON())
        res.status(200)
    } catch (e) {
        console.log(e)
        res.status(500)
        res.send('Unexpected internal server error')
    }
})



module.exports = router;


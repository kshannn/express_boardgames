// =================================== IMPORTED =================================== 
// import express and express router
const express = require('express')
const router = express.Router()

// import model
const { User } = require('../../models')

// import bodyParser
// const bodyParser = require('body-parser');

// =================================== ROUTES =================================== 

// === [C] create user account ===
router.post('/create', async (req,res) => {
    try {
        // set data from req.body directly to database
        const user = new User();
        console.log(1)
        console.log(req.body)
        user.set('username', req.body.username)
        user.set('email', req.body.email)
        user.set('password', req.body.password)
        user.set('address', req.body.address)
        user.set('phone_number', req.body.phone_number)
        await user.save()
        

        res.status(200)
        res.send(user)
    } catch (e) {
        console.log(e);
        res.status(500)
        res.send('Unexpected internal server error')
    }

})





module.exports = router;


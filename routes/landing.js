// =================================== IMPORTED =================================== 
// import express and express router
const express = require('express')
const router = express.Router();

// import caolan form 
const {
    bootstrapField,
    createLoginForm
} = require('../forms');

// import model
const {
    Vendor
} = require('../models')

// import crypto for password encryption
const crypto = require('crypto');
const getHashedPassword = (password) => {
    const sha256 = crypto.createHash('sha256');
    const hash = sha256.update(password).digest('base64');
    return hash;
}

// === Login for Vendor ===
// 1. render login form
router.get('/', async (req, res) => {
    const loginForm = createLoginForm();
    res.render('auth/login', {
        'form': loginForm.toHTML(bootstrapField)
    })
})

// 2. process login form
router.post('/', async (req, res) => {
    const loginForm = createLoginForm();
    loginForm.handle(req, {
        'success': async (form) => {
            // find vendor by email
            let vendor = await Vendor.where({
                'email': form.data.email
            }).fetch({
                require: false
            });

            // 1. case 1 - vendor email doesn't match database (no data fetched)
            if (!vendor) {
                req.flash("error_messages", "Sorry, the authentication details you have provided is invalid. Please try again.")
                res.redirect('/')
            } else {
                // 2. case2 - vendor email match database
                // check if password matches database too
                if (vendor.get('password') === getHashedPassword(form.data.password)) {

                    // store vendor details in session if login is successful
                    req.session.vendor = {
                        id: vendor.get('id'),
                        username: vendor.get('username'),
                        email: vendor.get('email')
                    }
                    req.flash("success_messages", "Welcome, " + vendor.get('username'));
                    res.redirect('/listings');
                } else {
                    req.flash("error_messages", "Sorry, the authentication details you have provided is invalid. Please try again.")
                    res.redirect('/')
                }
            }
        },
        'error': async (form) => {
            res.render('auth/login', {
                'form': form.toHTML(bootstrapField)
            })
            req.flash('error_messages', 'Failed to login. Please try again.')
        }
    })
})

// === Logout for Vendor ===
router.get('/logout', async (req, res) => {

    if (req.session.vendor) {
        req.session.vendor = null
        req.flash('success_messages', 'Logged out successfully. See you again!')
        res.redirect('/')
    } else {
        req.flash('error_messages', 'You are currently not logged in. Please log in to access the feature.')
        res.redirect('/')
    }

})

module.exports = router;
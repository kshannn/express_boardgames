// =================================== IMPORTED =================================== 
// import express and express router
const express = require('express')
const router = express.Router();

// import caolan form 
const {
    bootstrapField,
    createVendorRegistrationForm,
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
 
// =================================== ROUTES =================================== 
// === [C] create vendor account ===
// 1. render form
router.get('/create', async (req, res) => {
    const vendorRegistrationForm = createVendorRegistrationForm();
    res.render('auth/create', {
        'form': vendorRegistrationForm.toHTML(bootstrapField)
    })
})

// 2. process form
router.post('/create', async (req, res) => {
    const vendorRegistrationForm = createVendorRegistrationForm();
    vendorRegistrationForm.handle(req, {
        'success': async (form) => {

            // case 1 - email already exist in database
            // find vendor by email
            let vendor = await Vendor.where({
                'email': form.data.email
            }).fetch({
                require: false
            });

            let emailExist = false

            if (vendor) {
                emailExist = true
            }

            // case 2 - email does not exist in database
            if (!emailExist) {
                const vendor = new Vendor()
                vendor.set('username', form.data.username)
                vendor.set('address', form.data.address)
                vendor.set('email', form.data.email)
                vendor.set('password', getHashedPassword(form.data.password))
                await vendor.save();
                req.flash("success_messages", `Account successfully created.`)
                res.redirect('/auth/login')
            } 
            else {
                req.flash('error_messages', 'Current email has already been used. Please pick another email.')
                res.redirect('/auth/create')
            }
        },
        'error': async (form) => {
            res.render('auth/create', {
                'form': form.toHTML(bootstrapField)
            })
            req.flash('error_messages', 'Failed to create account. Please try again.')
        }
    })
})


// === [U] update vendor account ===
// 1. render form
// router.get('/update', async (req,res), {

// })


// === Login for Vendor ===
// 1. render login form
router.get('/login', async (req, res) => {
    const loginForm = createLoginForm();
    res.render('auth/login', {
        'form': loginForm.toHTML(bootstrapField)
    })
})

// 2. process login form
router.post('/login', async (req, res) => {
    const loginForm = createLoginForm();
    loginForm.handle(req, {
        'success': async (form) => {
            // find vendor by email
            let vendor = await Vendor.where({
                'email': form.data.email
            }).fetch({
                require: false
            });

            // 1. case1 - vendor email doesn't match database (no data fetched)
            if (!vendor) {
                req.flash("error_messages", "Sorry, the authentication details you have provided is invalid. Please try again.")
                res.redirect('/auth/login')
            } else {
                // 2. case2 - vendor email match database
                // check if password matches database too
                if (vendor.get('password') === getHashedPassword(form.data.password)){

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
                    res.redirect('/auth/login')
                }
            }
        }
    })
})

// === Logout for Vendor ===
router.get('/logout', async (req, res) => {

    if (req.session.vendor){
        req.session.vendor = null
        req.flash('success_messages','Logged out successfully. See you again!')
        res.redirect('/auth/login')
    } else {
        req.flash('error_messages','You are currently not logged in. Please log in to access the feature.')
        res.redirect('/auth/login')
    }
   
})

module.exports = router;
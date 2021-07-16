const express = require('express')
const router = express.Router();
const {
    bootstrapField,
    createVendorRegistrationForm,
    createLoginForm
} = require('../forms');

// import model
const {
    Vendor,
    User
} = require('../models')

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
            const vendor = new Vendor()
            vendor.set('username', form.data.username)
            vendor.set('address', form.data.address)
            vendor.set('email', form.data.email)
            vendor.set('password', form.data.password)
            await vendor.save();
            req.flash("success_messages", `Account successfully created.`)
            res.redirect('/auth/login')
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
            // find user by email
            let user = await User.where({
                'email': form.data.email
            }).fetch({
                require: false
            });

            // 1. case1 - user email doesn't match database (no data fetched)
            if (!user) {
                req.flash("error_messages", "Sorry, the authentication details you have provided is invalid. Please try again.")
                res.redirect('/auth/login')
            } else {
            // 2. case2 - user email match database
                // check if password matches database
                if (user.get('password') === form.data.password) {
                    // add to the session that login succeed

                    // store the user details
                    req.session.user = {
                        id: user.get('id'),
                        username: user.get('username'),
                        email: user.get('email')
                    }
                    req.flash("success_messages", "Welcome back, " + user.get('username'));
                    res.redirect('/users/profile');
                } else {
                    req.flash("error_messages", "Sorry, the authentication details you have provided is invalid. Please try again.")
                    res.redirect('/users/login')
                }

            }

            
        }
    })
    

    
})




module.exports = router;
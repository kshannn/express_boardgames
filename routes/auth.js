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

// import middleware
const { checkIfAuthenticated } = require('../middlewares');

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
                vendor.set('phone_number', form.data.phone_number)
                vendor.set('email', form.data.email)
                vendor.set('password', getHashedPassword(form.data.password))
                await vendor.save();
                req.flash("success_messages", `Account successfully created.`)
                res.redirect('/')
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


// === [R] read vendor account ===
router.get('/profile', checkIfAuthenticated, async (req,res) => {
    let vendor = await Vendor.where({
        'id': req.session.vendor.id
    }).fetch({
        require: true
    });

    res.render('auth/index', {
        'vendor': vendor.toJSON()
    })

})

module.exports = router;
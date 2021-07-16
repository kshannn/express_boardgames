const express = require('express')
const router = express.Router();
const { bootstrapField, createVendorRegistrationForm, createLoginForm } = require('../forms');

// import model
const { Vendor } = require('../models')

// === [C] create vendor account ===
// 1. render form
router.get('/create', async (req,res) => {
    const vendorRegistrationForm = createVendorRegistrationForm();
    res.render('auth/create', {
        'form': vendorRegistrationForm.toHTML(bootstrapField)
    })
})

// 2. process form
router.post('/create', async (req,res) => {
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
router.get('/login', async (req,res) => {
    const loginForm = createLoginForm();
    res.render('auth/login', {
        'form': loginForm.toHTML(bootstrapField)
    })
})




module.exports = router;
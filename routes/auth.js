const express = require('express')
const router = express.Router();
const { bootstrapField, createVendorRegistrationForm } = require('../forms');

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
            vendor.set('phone_number', form.data.phone_number)
            vendor.set('email', form.data.email)
            vendor.set('password', form.data.password)
            await vendor.save();
            res.redirect('/')
        },
        'error': async (vendorRegistrationForm) => {
            res.render('auth/create', {
                'form': vendorRegistrationForm.toHTML(bootstrapField)
            })
        }
    })
})


module.exports = router;
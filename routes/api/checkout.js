// =================================== IMPORTED =================================== 
// import express and express router
const express = require('express')
const router = express.Router()

// import model
const {
    CartItem
} = require('../../models')

// import Stripe
const Stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

// import JSON web token
const jwt = require('jsonwebtoken');

// import middleware
const {
    checkIfAuthenticatedJWT
} = require('../../middlewares')

// import bodyparser (for stripe webhooks)
const bodyParser = require('body-parser');

// =================================== ROUTES =================================== 
// === [] to obtain session id ===
router.get('/', async (req, res) => {

    // check if user is logged in (using tokens)
    jwt.verify(req.query.token, process.env.TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403);
        }

        req.user = user;
    });

    // console.log(req.query.token);
    const user = req.user
    // console.log('userrr', user)

    // get all items from cart
    const cartItems = await CartItem.collection().where('user_id', user.id).fetch({
        withRelated: ['gameListing']
    })
    // console.log(cartItems.toJSON())

    // 1. create line items
    let lineItems = []
    let meta = []
    for (let cartItem of cartItems) {

        const lineItem = {
            'name': cartItem.related('gameListing').get('name'),
            'amount': cartItem.related('gameListing').get('price'),
            'quantity': cartItem.get('quantity'),
            'currency': 'SGD'
        }

        if (cartItem.related('gameListing').get('image')) {
            lineItem['images'] = [cartItem.related('gameListing').get('image')]
        }

        lineItems.push(lineItem)

        // save quantity data along with game id
        meta.push({
            'user_id':user.id,
            'gameListing_id': cartItem.related('gameListing').get('id'),
            'quantity': cartItem.get('quantity')
        })

    }

    // 2. create stripe payment
    let metaData = JSON.stringify(meta)
    const payment = {
        payment_method_types: ['card'],
        line_items: lineItems,
        success_url: process.env.STRIPE_SUCCESS_URL,
        cancel_url: process.env.STRIPE_ERROR_URL,
        metadata: {
            'orders': metaData
        }
    }


    // step 3: register the session
    let stripeSession = await Stripe.checkout.sessions.create(payment)

    res.render('checkout/checkout', {
        'sessionId': stripeSession.id, // 4. get session id
        'publishableKey': process.env.STRIPE_PUBLISHABLE_KEY
    })

})


// === [] webhooks for stripe
router.post('/process_payment', bodyParser.raw({type: 
    'application/json'}), async (req, res) => {

        let payload = req.body
        let endpointSecret = process.env.STRIPE_ENDPOINT_SECRET
        let sigHeader = req.headers["stripe-signature"]

        let event;
        try {
            event = Stripe.webhooks.constructEvent(payload, sigHeader, endpointSecret);
        } catch (e) {
            res.send({
                'error': e.message
            })
            console.log(e.message)
        } 
        if (event.type == 'checkout.session.completed'){
            let stripeSession = event.data.object
            console.log(stripeSession)
        }
        res.send({ received: true })
})


module.exports = router;
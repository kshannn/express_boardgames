// =================================== IMPORTED =================================== 
// import express and express router
const express = require('express')
const router = express.Router()

// import model
const {
    CartItem,
    OrderItem,
    Order,
    User
} = require('../../models')

// import Stripe
const Stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

// import JSON web token
const jwt = require('jsonwebtoken');

// import bodyparser (for stripe webhooks)
const bodyParser = require('body-parser');

// import dal
const cartItemDataLayer = require('../../dal/cartItems')
const listingDataLayer = require('../../dal/listings')

// =================================== ROUTES =================================== 
// === [] to obtain session id ===
router.get('/', async (req, res) => {

    // check if user is logged in (using tokens)
    await jwt.verify(req.query.token, process.env.TOKEN_SECRET, (err, user) => {
        if (err) {
            res.redirect('https://loving-mayer-9f2c72.netlify.app/login' + '?' + 'session=expire&' + 'callback_url=' + 'https://loving-mayer-9f2c72.netlify.app/cart')
        }

        req.user = user;
    });

    const user = req.user


    // clear previous potential order if any
    let prevPotentialOrder = await Order.collection().where({
        'user_id': user.id,
        'status_id': 1
    }).fetch({
        require: false
    })

    for (let each_prevPotentialOrder of prevPotentialOrder) {
        each_prevPotentialOrder.destroy()
    }


    // get current cart items
    let currentCartItems = await CartItem.collection().where('user_id', user.id).fetch({
        withRelated: ['gameListing'],
        require: true
    })

    // get total cost of current cart item
    let total = 0
    for (let each_cartItem of currentCartItems.toJSON()) {
        if (each_cartItem.quantity <= each_cartItem.gameListing.stock) {
            total += each_cartItem.unit_price * each_cartItem.quantity
        } else {
            res.redirect('https://loving-mayer-9f2c72.netlify.app/cart' + '?' + 'stock=insufficient')
        }
    }

    // get user address from JWT user variable
    let selectedUser = await User.where('id', user.id).fetch()
    let userAddress = selectedUser.toJSON().address


    // add potential order info
    const potentialOrder = new Order({
        'user_id': user.id,
        'status_id': 1,
        'order_date': new Date(),
        'total_cost': total,
        'user_address': userAddress
    });
    await potentialOrder.save()




    // get all items from cart
    const cartItems = await cartItemDataLayer.getCartItemByUserId(user.id)


    // 1. create line items
    let lineItems = []
    let meta = []
    for (let cartItem of cartItems) {

        // 1. Create potential order items tgt with potential order above
        let fetchedPotentialOrder = await Order.collection().where({
            'user_id': user.id,
            'status_id': 1
        }).fetchOne({
            require: true
        })


        const potentialOrderItem = new OrderItem()
        potentialOrderItem.set('order_id', fetchedPotentialOrder.get('id'))
        potentialOrderItem.set('gameListing_id', cartItem.related('gameListing').get('id'))
        potentialOrderItem.set('quantity', cartItem.get('quantity'))
        potentialOrderItem.set('unit_price', cartItem.related('gameListing').get('price'))
        await potentialOrderItem.save()



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
            'user_id': user.id,
            'gameListing_id': cartItem.related('gameListing').get('id'),
            'quantity': cartItem.get('quantity'),
            'unit_price': cartItem.related('gameListing').get('price')
        })

    }

    // retrieve order id from potential order (latest order Id)
    let order = await Order.collection().where({
        'user_id': user.id,
        'status_id': 1
    }).fetchOne()

    let latestOrderId = order.toJSON().id



    // 2. create stripe payment
    let metaData = JSON.stringify(meta)
    const payment = {
        payment_method_types: ['card'],
        line_items: lineItems,
        success_url: process.env.STRIPE_SUCCESS_URL + "?orderId=" + latestOrderId,
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
router.post('/process_payment', bodyParser.raw({
    type: 'application/json'
}), async (req, res) => {

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
    if (event.type == 'checkout.session.completed') {

        let stripeSession = event.data.object

        let metaInfo = JSON.parse(stripeSession.metadata.orders)


        // [U] update order info (change status)
        let confirmedOrder = await Order.collection().where({
            'user_id': metaInfo[0].user_id,
            'status_id': 1
        }).fetchOne({
            require: true
        })

        confirmedOrder.set('status_id', 2)
        confirmedOrder.set('order_date', new Date())
        await confirmedOrder.save()


        
        for (let eachMetaInfo of metaInfo) {
            // for each orderitem, delete corresponding game stock
            let gameListing = await listingDataLayer.getGameListingById(eachMetaInfo.gameListing_id)
            gameListing.set('stock', gameListing.get('stock') - eachMetaInfo.quantity)
            await gameListing.save()
        }

        // [D] empty cart items
        let cartItemToEmpty = await cartItemDataLayer.getCartItemByUserId(metaInfo[0].user_id)
        for (let eachCartItemToEmpty of cartItemToEmpty) {
            eachCartItemToEmpty.destroy()
        }

    }
    res.send({
        received: true
    })

})


module.exports = router;
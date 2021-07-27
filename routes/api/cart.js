// =================================== IMPORTED =================================== 
// import express and express router
const express = require('express')
const router = express.Router()

// import model
const { CartItem, Order } = require('../../models')

// import middleware
const {
    checkIfAuthenticatedJWT
} = require('../../middlewares')

// import dal
const cartItemDataLayer = require('../../dal/cartItems')


// =================================== ROUTES =================================== 
// === [R] read cart items for a particular user ===
router.get('/:userId', async (req,res) => {
    try {
        const cartItem = await cartItemDataLayer.getCartItemByUserId(req.params.userId)
        
        res.send(cartItem.toJSON())
        res.status(200)
    } catch (e) {
        console.log(e)
        res.status(500)
        res.send('Unexpected internal server error')
    }
})


// === [C] add game listing to cart ===
router.post('/:gameListingId/add', async (req,res) => {
    try {

        // find if a game listing exist in the user's cart
        let cartItem = await cartItemDataLayer.getCartItemByGameIdAndUserId(req.params.gameListingId,req.body.user_id)


        // case 1 - Game exist in cart, add 1 to existing quantity
        if (cartItem) {
            cartItem.set('quantity', cartItem.get('quantity') + 1)
            await cartItem.save()
        } else {
             // case 2 - Game does not exist in cart, add game to cart item
             const cartItem = new CartItem()
             cartItem.set('user_id', req.body.user_id)
             cartItem.set('gameListing_id', req.params.gameListingId)
             cartItem.set('quantity', 1)
             cartItem.set('unit_price', req.body.unit_price)
             await cartItem.save()
        }

        console.log(cartItem);

        
        res.send(cartItem.toJSON())
        res.status(200)
    } catch (e) {
        console.log(e)
        res.status(500)
        res.send('Unexpected internal server error')
    }

})

// === [] reduce quantity of game listing by one ===
router.post('/:gameListingId/subtract', async (req,res) => {
    try {

        // find if a game listing exist in the user's cart
        let cartItem = await cartItemDataLayer.getCartItemByGameIdAndUserId(req.params.gameListingId,req.body.user_id)

        // if cart item exist, subtract one from cart
        if (cartItem){
            cartItem.set("quantity", cartItem.get("quantity") - 1)
            await cartItem.save()
        }
        
        res.send(cartItem.toJSON())
        res.status(200)
    } catch (e) {
        console.log(e)
        res.status(500)
        res.send('Unexpected internal server error')
    }
})


// === [D] remove entire game listing from cart ===
router.post('/:gameListingId/remove', async (req,res) => {
    try {

        // get a game listing from a particular user's cart
        let cartItem = await cartItemDataLayer.getCartItemByGameIdAndUserId(req.params.gameListingId,req.body.user_id)
    

        // if cartItem exist, remove it from cart
        if (cartItem){
            cartItem.destroy()
        }
    
        
        res.send(cartItem.toJSON())
        res.status(200)
    } catch (e) {
        console.log(e)
        res.status(500)
        res.send('Unexpected internal server error')
    }
})

// === [] potential checkout ===
router.post('/preparing', async (req,res) => {
    try {
        // clear previous potential order if any
        let prevPotentialOrder = await Order.collection().where({
            'user_id': req.body.user_id,
            'status_id': 1
        }).fetch({
            require: false
        })

        for (let each_prevPotentialOrder of prevPotentialOrder){
            each_prevPotentialOrder.destroy()
        }

         // add potential order info
        const order = new Order({
        'user_id': req.body.user_id,
        'status_id': 1,
        'order_date': new Date(),
        'total_cost': req.body.total_cost
        });
        await order.save()

        res.send(order.toJSON())
        res.status(200)
    } catch (e) {
        console.log(e)
        res.status(500)
        res.send('Unexpected internal server error')
    }
})





module.exports = router;

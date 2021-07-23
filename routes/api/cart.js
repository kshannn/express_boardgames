// =================================== IMPORTED =================================== 
// import express and express router
const express = require('express')
const router = express.Router()

// import model
const { CartItem } = require('../../models')


// =================================== ROUTES =================================== 
// === [R] read cart items for a particular user ===
router.get('/:userId', async (req,res) => {
    try {
        const cartItem = await CartItem.collection().where('user_id',req.params.userId).fetch({
            withRelated: ['gameListing']
        })
        
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
        let  cartItem= await CartItem.where({
            'gameListing_id': req.params.gameListingId,
            'user_id': req.body.user_id
        }).fetch({
            require: false
        })


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

        
        res.send(cartItem.toJSON())
        res.status(200)
    } catch (e) {
        console.log(e)
        res.status(500)
        res.send('Unexpected internal server error')
    }

})


// === [D] remove game listing from cart ===
router.post('/:gameListingId/remove', async (req,res) => {
    try {

        // get a game listing from a particular user's cart
        let  cartItem= await CartItem.where({
            'gameListing_id': req.params.gameListingId,
            'user_id': req.body.user_id
        }).fetch({
            require: false
        })

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





module.exports = router;

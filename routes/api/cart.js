// =================================== IMPORTED =================================== 
// import express and express router
const express = require('express')
const router = express.Router()

// import model
const { CartItem, GameListing } = require('../../models')


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

        // let gameListing = await GameListing.collection().where('gameListing_id', req.params.gameListingId).fetch()
        // find if a game listing exist in the user's cart
        let  cartItem= await CartItem.where({
            'gameListing_id': req.params.gameListingId,
            'user_id': 5
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
             cartItem.set('user_id', 5)
             cartItem.set('gameListing_id', req.params.gameListingId)
             cartItem.set('quantity', 1)
             cartItem.set('total_cost', 3000)
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

// fetch user id 

// fetch gameListing id

// if item not in cart, set quantity to one

// if item in cart, add to quantity




module.exports = router;

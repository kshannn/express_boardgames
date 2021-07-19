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
        const cartItem = await CartItem.collection().where('user_id',req.params.userId).fetch()
        
        res.send(cartItem.toJSON())
        res.status(200)
    } catch (e) {
        console.log(e)
        res.status(500)
        res.send('Unexpected internal server error')
    }
})


// === [C] add game listing to cart ===
router.post('/:userId/:gameListingId/add', async (req,res) => {
    try {

        let gameListing = await GameListing.collection().where('gameListing_id', req.params.gameListingId).fetch()

        const cartItem = new CartItem()
        cartItem.set('user_id', req.params.userId)
        cartItem.set('gameListing_id', req.params.gameListingId)
        cartItem.set('quantity', 1)
        cartItem.set('total_cost', 3000)
        await cartItem.save()
        
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

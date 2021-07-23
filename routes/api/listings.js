// =================================== IMPORTED =================================== 
// import express and express router
const express = require('express')
const router = express.Router()

// import model
const { GameListing } = require('../../models')

// import dal
const listingDataLayer = require('../../dal/listings')

// =================================== ROUTES =================================== 
// === [R] display all games ===
router.get('/', async (req,res) => {
    try {
        const gameListings = await GameListing.collection().fetch()
        
        res.send(gameListings.toJSON())
        res.status(200)
    } catch (e) {
        console.log(e)
        res.status(500)
        res.send('Unexpected internal server error')
    }
})

// === [R] display selected game ===
router.get('/:listingId', async (req,res) => {
    try {
        const gameListing = await listingDataLayer.getGameListingById(req.params.listingId)
        
        res.send(gameListing.toJSON())
        res.status(200)
    } catch (e) {
        console.log(e)
        res.status(500)
        res.send('Unexpected internal server error')
    }
})

module.exports = router;

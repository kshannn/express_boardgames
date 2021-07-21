// =================================== IMPORTED =================================== 
// import express and express router
const express = require('express')
const router = express.Router()

// import model
const { GameListing } = require('../../models')


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


module.exports = router;

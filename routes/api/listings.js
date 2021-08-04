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

// === [] display filtered games ===
router.post('/', async (req,res) => {
    try {
        
        // master query
        let q = await GameListing.collection()

        console.log('req body: ', req.body)
        if (req.body.searchName){
            q = q.where('name', 'like', '%' + req.body.searchName + '%')
        }
        
        req.body.searchMinPrice = parseInt(req.body.searchMinPrice) * 100
        if (req.body.searchMinPrice){
            q = q.where('price', '>=', req.body.searchMinPrice)
        }
        
        if (req.body.searchMaxPrice){
            q = q.where('price', '<=', req.body.searchMaxPrice)
        }

      
        if (req.body.searchAge){
            q = q.where('age', '>=', req.body.searchAge)
        }

        
        if (req.body.searchCategories.length){
            q = q.query("join", "categories_gameListings", "gameListings.id", "gameListing_id").where("category_id", "in", req.body.searchCategories)
        }



      

        let gameListings = await q.fetch({
            withRelated: ['category']
        })

        
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

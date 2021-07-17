const express = require('express');
const router = express.Router();
const { bootstrapField, createGameForm } = require('../forms');

// import model
const { GameListing, Category } = require('../models')

// === [R] display all games ===
router.get('/', async (req,res) => {
    let gameListings = await GameListing.collection().fetch({withRelated: ['vendor']});
    res.render('listings/index',{
        'gameListings': gameListings.toJSON()
    })
})

// === [C] create game ===
// 1. render form
router.get('/create', async (req,res) => {
    // fetch categories
    let allCategories = await Category.fetchAll().map( category => [category.get('id'),category.get('name')])

    const gameForm = createGameForm(allCategories);
    res.render('listings/create',{
        'form': gameForm.toHTML(bootstrapField)
    })
})

// 2. process form
router.post('/create', async (req,res) => {
    const gameForm = createGameForm();
    gameForm.handle(req, {
        'success': async (form) => {
            // create new instance in games table
            let {categories, ...gameListingData} = form.data 

            // set all the fields from form.data in object format when creating an instance of GameListing
            const gameListing = new GameListing(gameListingData);

            console.log(form.data) // returns all key/value of all form fields
            console.log(gameListingData) // returns all keu/values for each form fields except for 'categories' field
            console.log(categories) // returns just the values for categories in string

        
            gameListing.set('image', 'testimageurl')
            gameListing.set('posted_date', new Date())
            gameListing.set('vendor_id', req.session.vendor.id)
            await gameListing.save()

            // if categories are selected, add them to the associative table (i.e. categories_gameListings)
            if (categories) {
                await gameListing.category().attach(categories.split(","))
            }

            res.redirect('/listings')

        }
    })

})

module.exports = router;
// =================================== IMPORTED =================================== 
// import express and express router
const express = require('express');
const router = express.Router();

// import caolan form
const { bootstrapField, createGameForm } = require('../forms');

// import model
const { GameListing, Category } = require('../models')

// import dal
const listingDataLayer = require('../dal/listings')

// import uploadcare public key 
const img_key = process.env.UPLOADCARE_PUBLIC_KEY


// =================================== ROUTES =================================== 
// === [R] display all games ===
router.get('/', async (req,res) => {
    let gameListings = await GameListing.collection().where(
        'vendor_id', req.session.vendor.id
    ).fetch()
    
    // if return single item (i.e. not array), put in array
    gameListings = Array.isArray(gameListings.toJSON())? gameListings.toJSON(): [gameListings.toJSON()]
    
    res.render('listings/index',{
        'gameListings': gameListings
    })
})

// === [C] create game ===
// 1. render form
router.get('/create', async (req,res) => {
    // fetch categories
    let allCategories = await listingDataLayer.getAllCategories()

    const gameForm = createGameForm(allCategories);
    res.render('listings/create',{
        'form': gameForm.toHTML(bootstrapField),
        'img_key': img_key
    })
})

// 2. process form
router.post('/create', async (req,res) => {
    const gameForm = createGameForm();
    gameForm.handle(req, {
        'success': async (form) => {
           // set all the fields from form.data in object format when creating an instance of GameListing
            let {categories, image, ...gameListingData} = form.data 

             // create new instance in games table
            const gameListing = new GameListing(gameListingData);

            // console.log(form.data) // returns all key/value of all form fields
            // console.log(gameListingData) // returns all key/values for each form fields except for 'categories' field
            // console.log(categories) // returns just the values for categories in string
        
            gameListing.set('image', image.slice(1))
            gameListing.set('posted_date', new Date())
            gameListing.set('vendor_id', req.session.vendor.id)
            await gameListing.save()

            // if categories are selected, add them to the associative table (i.e. categories_gameListings)
            if (categories) {
                await gameListing.category().attach(categories.split(","))
            }
            req.flash('success_messages','Listing successfully created!')
            res.redirect('/listings')
        },
        'error': async (form) => {
            res.render('listings/create',{
                'form': form.toHTML(bootstrapField)
            })
            req.flash('error_messages','There was an error in creating the listing. Please try again.')
        }
    })
})

// === [U] update game ===
// 1. render form
router.get('/:listingId/update', async (req, res) => {
    // retrieve game listing
    const gameListing = await listingDataLayer.getGameListingById(req.params.listingId)

    // fetch categories
    let allCategories = await listingDataLayer.getAllCategories()

    // retrieve form
    const gameForm = createGameForm(allCategories);

    // fill in existing form
    gameForm.fields.name.value = gameListing.get('name')
    gameForm.fields.price.value = gameListing.get('price')
    gameForm.fields.description.value = gameListing.get('description')
    gameForm.fields.min_player_count.value = gameListing.get('min_player_count')
    gameForm.fields.max_player_count.value = gameListing.get('max_player_count')
    gameForm.fields.min_age.value = gameListing.get('min_age')
    gameForm.fields.duration.value = gameListing.get('duration')
    gameForm.fields.designer.value = gameListing.get('designer')
    gameForm.fields.publisher.value = gameListing.get('publisher')
    gameForm.fields.stock.value = gameListing.get('stock')
    gameForm.fields.published_date.value = gameListing.get('published_date')

    // fill in existing category (many-to-many), rmb to bring in the relationship with the model using withRelated
    let selectedCategories = await gameListing.related('category').pluck('id'); // returns an array of id
    gameForm.fields.categories.value = selectedCategories

    // render form
    res.render('listings/update', {
        'form': gameForm.toHTML(bootstrapField),
        'gameListing': gameListing.toJSON()
    })
})

// 2. process form
router.post('/:listingId/update', async (req,res) => {
    // retrieve listing to update
    const gameListing = await listingDataLayer.getGameListingById(req.params.listingId)

     // fetch categories
     let allCategories = await listingDataLayer.getAllCategories()

    // retrieve form
    const gameForm = createGameForm(allCategories); 
    
    // process form
    gameForm.handle(req, {
        'success': async(form) => {
            let {categories, ...gameListingData} = form.data
            gameListing.set (gameListingData)
            gameListing.set('image', 'testimageurl')
            await gameListing.save()

            // clear existing categories
            let existingCategories = await gameListing.related('category').pluck('id');
            gameListing.category().detach(existingCategories);

            // re-add selected categories
            if (categories) {
                await gameListing.category().attach(categories.split(","))
            }

            req.flash('success_messages','Listing successfully updated!')
            res.redirect('/listings')
        },
        'error': async (form) => {
            res.render('listings/update', {
                'form': gameForm.toHTML(bootstrapField),
                'gameListing': gameListing.toJSON()
            }),
            req.flash('error_messages','There was an error in updating the listing. Please try again.')
        }
    })
    
 
    
})


// === [D] delete game ===
// 1. render 
router.get('/:listingId/delete', async (req,res)=> {
    // fetch listing to be deleted
    const gameListing = await listingDataLayer.getGameListingById(req.params.listingId)

    res.render('listings/delete', {
        'gameListing': gameListing.toJSON()
    })
})

// 2. process
router.post('/:listingId/delete', async (req,res) => {
    // fetch listing to be deleted
    const gameListing = await listingDataLayer.getGameListingById(req.params.listingId)

    await gameListing.destroy()
    req.flash('success_messages', 'Listing has been successfully removed')
    res.redirect('/listings')
})

module.exports = router;
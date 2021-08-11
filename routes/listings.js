// =================================== IMPORTED =================================== 
// import express and express router
const express = require('express');
const router = express.Router();

// import caolan form
const {
    bootstrapField,
    createGameForm,
    createSearchForm
} = require('../forms');

// import model
const {
    GameListing
} = require('../models')

// import dal
const listingDataLayer = require('../dal/listings')

// import uploadcare public key 
const img_key = process.env.UPLOADCARE_PUBLIC_KEY

// import middleware
const {
    checkIfAuthenticated
} = require('../middlewares');


// =================================== ROUTES =================================== 
// === [R] display all games ===
router.get('/', checkIfAuthenticated, async (req, res) => {


    // === Search Engine ===
    // fetch categories and populate form
    let allCategories = await listingDataLayer.getAllCategories()
    const searchForm = createSearchForm(allCategories)


    // master query
    let q = GameListing.collection()

    searchForm.handle(req, {
        'empty': async (form) => {
            // 1. Case 1 - No search, returns all results
            let gameListings = await GameListing.collection().where(
                'vendor_id', req.session.vendor.id
            ).fetch({
                withRelated: ['category']
            })

            // if return single item (i.e. not array), put in array
            gameListings = Array.isArray(gameListings.toJSON()) ? gameListings.toJSON() : [gameListings.toJSON()]


            res.render('listings/index', {
                'gameListings': gameListings.reverse(),
                'form': form.toHTML(bootstrapField)
            })
        },
        'error': async (form) => {
            // 2. Case 2 - Invalid search field, returns all results with validation msg
            let gameListings = await GameListing.collection().where(
                'vendor_id', req.session.vendor.id
            ).fetch()

            // if return single item (i.e. not array), put in array
            gameListings = Array.isArray(gameListings.toJSON()) ? gameListings.toJSON() : [gameListings.toJSON()]

            res.render('listings/index', {
                'gameListings': gameListings,
                'form': form.toHTML(bootstrapField)
            })
        },
        'success': async (form) => {

            if (form.data.name) {
                q = q.where('name', 'like', '%' + form.data.name.toUpperCase() + '%')
            }


            if (form.data.categories) {
                q = q.query("join", "categories_gameListings", "gameListings.id", "gameListing_id").where("category_id", "in", form.data.categories.split(","))
            }

            if (form.data.min_price) {
                q = q.where('price', '>=', form.data.min_price)
            }

            if (form.data.max_price) {
                q = q.where('price', '<=', form.data.max_price)
            }

            // additional 'where' query set to limit to returning specific vendor results
            let gameListings = await q.where('vendor_id', req.session.vendor.id).fetch({
                withRelated: ['category']
            })

            res.render('listings/index', {
                'gameListings': gameListings.toJSON(),
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

// === [C] create game ===
// 1. render form
router.get('/create', checkIfAuthenticated, async (req, res) => {
    // fetch categories
    let allCategories = await listingDataLayer.getAllCategories()

    const gameForm = createGameForm(allCategories);
    res.render('listings/create', {
        'form': gameForm.toHTML(bootstrapField),
        'img_key': img_key
    })
})

// 2. process form
router.post('/create', checkIfAuthenticated, async (req, res) => {
    let allCategories = await listingDataLayer.getAllCategories()
    const gameForm = createGameForm(allCategories);
    gameForm.handle(req, {
        'success': async (form) => {
            // set all the fields from form.data in object format when creating an instance of GameListing
            let {
                categories,
                image,
                // price,
                ...gameListingData
            } = form.data
            gameListingData.name = gameListingData.name.toUpperCase();

            // create new instance in games table
            const gameListing = new GameListing(gameListingData);


            let splitImage = image.split(',')[1]
            gameListing.set('image', splitImage)
            // gameListing.set('price', form.data.price * 100)
            gameListing.set('posted_date', new Date())
            gameListing.set('vendor_id', req.session.vendor.id)
            await gameListing.save()

            // if categories are selected, add them to the associative table (i.e. categories_gameListings)
            if (categories) {
                await gameListing.category().attach(categories.split(","))
            }
            req.flash('success_messages', 'Listing successfully created!')
            res.redirect('/listings')
        },
        'error': async (form) => {
            res.render('listings/create', {
                'form': form.toHTML(bootstrapField),
                'img_key': img_key
            })
            req.flash('error_messages', 'There was an error in creating the listing. Please try again.')
        }
    })
})

// === [U] update game ===
// 1. render form
router.get('/:listingId/update', checkIfAuthenticated, async (req, res) => {
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

    // fill in existing image
    const prefilledImage = gameListing.get('image')

    // render form
    res.render('listings/update', {
        'form': gameForm.toHTML(bootstrapField),
        'gameListing': gameListing.toJSON(),
        'img_key': img_key,
        'prefilledImage': prefilledImage
    })
})

// 2. process form
router.post('/:listingId/update', checkIfAuthenticated, async (req, res) => {
    // retrieve listing to update
    const gameListing = await listingDataLayer.getGameListingById(req.params.listingId)

    // fetch categories
    let allCategories = await listingDataLayer.getAllCategories()

    // retrieve form
    const gameForm = createGameForm(allCategories);

    // process form
    gameForm.handle(req, {
        'success': async (form) => {
            let {
                categories,
                image,
                // price,
                ...gameListingData
            } = form.data
            gameListingData.name = gameListingData.name.toUpperCase()
            gameListing.set(gameListingData)
            

            let slicedImage = image.split(',')[1]

            // gameListing.set('price', form.data.price * 100)
            gameListing.set('image', slicedImage)
            await gameListing.save()

            // clear existing categories
            let existingCategories = await gameListing.related('category').pluck('id');
            gameListing.category().detach(existingCategories);

            // re-add selected categories
            if (categories) {
                await gameListing.category().attach(categories.split(","))
            }

            req.flash('success_messages', 'Listing successfully updated!')
            res.redirect('/listings')
        },
        'error': async (form) => {
            // fill in existing image
            const prefilledImage = gameListing.get('image')

            res.render('listings/update', {
                    'form': form.toHTML(bootstrapField),
                    'gameListing': gameListing.toJSON(),
                    'img_key': img_key,
                    'prefilledImage': prefilledImage
                }),
                req.flash('error_messages', 'There was an error in updating the listing. Please try again.')
        }
    })
})


// === [D] delete game ===
// 1. render 
router.get('/:listingId/delete', checkIfAuthenticated, async (req, res) => {
    // fetch listing to be deleted
    const gameListing = await listingDataLayer.getGameListingById(req.params.listingId)

    res.render('listings/delete', {
        'gameListing': gameListing.toJSON()
    })
})

// 2. process
router.post('/:listingId/delete', checkIfAuthenticated, async (req, res) => {
    // fetch listing to be deleted
    const gameListing = await listingDataLayer.getGameListingById(req.params.listingId)

    await gameListing.destroy()
    req.flash('success_messages', 'Listing has been successfully removed')
    res.redirect('/listings')
})

module.exports = router;
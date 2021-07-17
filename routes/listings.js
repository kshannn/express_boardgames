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
            const gameListing = new GameListing();
            gameListing.set('name', form.data.name)
            gameListing.set('price', form.data.price)
            gameListing.set('description', form.data.description)
            gameListing.set('min_player_count', form.data.min_player_count)
            gameListing.set('max_player_count', form.data.max_player_count)
            gameListing.set('min_age', form.data.min_age)
            gameListing.set('duration', form.data.duration)
            gameListing.set('designer', form.data.designer)
            gameListing.set('publisher', form.data.publisher)
            gameListing.set('stock', form.data.stock)
            gameListing.set('image', 'testimageurl')
            gameListing.set('posted_date', new Date())
            gameListing.set('published_date', form.data.published_date)
            gameListing.set('vendor_id', req.session.vendor.id)
            await gameListing.save()

            // create new instance in categories_games table
            // const category_game = new 

            res.redirect('/listings')

        }
    })

})

module.exports = router;
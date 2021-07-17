const express = require('express');
const router = express.Router();
const { bootstrapField, createGameForm } = require('../forms');

// import model
const { Game } = require('../models')

// === [R] display all games ===
router.get('/', async (req,res) => {
    let games = await Game.collection().fetch({withRelated: ['vendor']});
    res.render('listings/index',{
        'games': games.toJSON()
    })
})

// === [C] create game ===
// 1. render form
router.get('/create', async (req,res) => {
    const gameForm = createGameForm();
    res.render('listings/create',{
        'form': gameForm.toHTML(bootstrapField)
    })
})

// 2. process form
router.post('/create', async (req,res) => {
    const gameForm = createGameForm();
    gameForm.handle(req, {
        'success': async (form) => {
            const game = new Game();
            game.set('name', form.data.name)
            game.set('price', form.data.price)
            game.set('description', form.data.description)
            game.set('min_player_count', form.data.min_player_count)
            game.set('max_player_count', form.data.max_player_count)
            game.set('min_age', form.data.min_age)
            game.set('duration', form.data.duration)
            game.set('designer', form.data.designer)
            game.set('publisher', form.data.publisher)
            game.set('stock', form.data.stock)
            game.set('posted_date', form.data.posted_date)
            game.set('published_date', new Date())
            await game.save()
            res.redirect('/games')

        }
    })

})

module.exports = router;
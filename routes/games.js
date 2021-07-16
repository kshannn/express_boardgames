const express = require('express');
const router = express.Router();

// import model
const { Game } = require('../models')

// === display all games ===
router.get('/', async (req,res) => {

    let games = await Game.collection().fetch({withRelated: ['vendor']});
    // let games = await Game.collection().fetch();

    res.render('games/index',{
        'games': games.toJSON()
    })
})

module.exports = router;
const express = require('express')
const router = express.Router();

// import model
const { Game, Vendor } = require('../models')

router.get('/', async (req,res) => {

    let games = await Game.collection().fetch();
    res.render('landing/index',{
        'games': games.toJSON()
    })

    // res.render('landing/index')
})

module.exports = router;
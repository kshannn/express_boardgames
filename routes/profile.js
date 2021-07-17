const express = require('express');
const router = express.Router();


router.get('/listings', async(req,res) => {
    res.render('listings/index')
})


module.exports = router;
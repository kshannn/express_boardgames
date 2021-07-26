// =================================== IMPORTED =================================== 
// import express and express router
const express = require('express')
const router = express.Router()

// import model
const { Order } = require('../../models')

// =================================== ROUTES =================================== 
// === [R] display orders for customer ===
router.get('/:userId/success', async (req,res) => {
    try {

        const orders = await Order.collection().where(
            'user_id', req.params.userId
        ).fetch({
            withRelated: ['orderItem']
        })
        // console.log(orders.toJSON())
        
        
        res.send(orders.toJSON())
        res.status(200)
    } catch (e) {
        console.log(e)
        res.status(500)
        res.send('Unexpected internal server error')
    }
})

module.exports = router;
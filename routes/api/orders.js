// =================================== IMPORTED =================================== 
// import express and express router
const express = require('express')
const router = express.Router()

// import model
const { Order } = require('../../models')

// =================================== ROUTES =================================== 
// === [R] display orders for customer ===
router.get('/:userId/history', async (req,res) => {
    try {

        const orders = await Order.collection().where(
            'user_id', req.params.userId
        ).fetch({
            withRelated: ['orderItem']
        })
        
        
        res.send(orders.toJSON())
        res.status(200)
    } catch (e) {
        console.log(e)
        res.status(500)
        res.send('Unexpected internal server error')
    }
})

// === [R] display recent order for customer ===
router.get('/success', async (req,res) => {
    let latestOrder = await Order.collection().where({
        "id": req.query.orderid
    }).fetchOne({
        withRelated: ['orderItem', 'orderItem.gameListing']
    })

    let orderedItems = latestOrder.toJSON().orderItem
    res.send(orderedItems)

})

module.exports = router;
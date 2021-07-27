// =================================== IMPORTED =================================== 
// import express and express router
const express = require('express')
const router = express.Router();

// import model
const { Order } = require('../models')

// =================================== ROUTES =================================== 
// === [R] display all orders for vendors ===
router.get('/', async (req,res) => {

    let orders = await Order.collection().fetch({
        withRelated: ['orderItem', 'orderItem.gameListing', 'status'],
        require: true
    })

    // store orders in array 
    orders = Array.isArray(orders.toJSON())? orders.toJSON(): [orders.toJSON()]

    console.log(orders)

    // extract status info
    let statuses = []
    for (let each_order of orders){
        statuses.push(each_order.status)
    }
 
    console.log(statuses)
    res.render('orders/index', {
        'orders':orders,
        'statuses': statuses
    })
})

// === [R] display specific order ===
router.get('/:orderId', async(req,res) => {
    let order = await Order.collection().where('id', req.params.orderId).fetchOne({
        withRelated: ['orderItem', 'orderItem.gameListing', 'status'],
        require: true
    })

    console.log(order.toJSON())

    let orderItems = order.toJSON().orderItem
    // console.log(orderItems)
    // console.log('ran')
    // console.log(order.toJSON())

    res.render('orders/details',{
        'order': order,
        'orderItems': orderItems
    })
})




module.exports = router;
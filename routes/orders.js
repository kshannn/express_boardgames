// =================================== IMPORTED =================================== 
// import express and express router
const express = require('express')
const router = express.Router();

// import model
const { Order } = require('../models')

// =================================== ROUTES =================================== 
// === [R] display all orders from customers ===
router.get('/', async (req,res) => {

    let orders = await Order.collection().fetch({
        withRelated: ['orderItem', 'orderItem.gameListing'],
        require: true
    })

    // orders = orders.toJSON()
    // console.log(orders)

    // for(let eachOrder of orders.toJSON()){
    //     console.log(eachOrder.orderItem);
    // }

    // orders = orders.toJSON();

    for(let eachOrder of orders){
        console.log(eachOrder.toJSON());
    }
   

    res.render('orders/index', {
        'orders':orders
    })
})

module.exports = router;
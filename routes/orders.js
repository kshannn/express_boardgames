// =================================== IMPORTED =================================== 
// import express and express router
const express = require('express')
const router = express.Router();

// import model
const { Order, Status } = require('../models')

// import caolan form
const { bootstrapField, updateOrderForm } = require('../forms');

// import middleware
const { checkIfAuthenticated } = require('../middlewares');

// =================================== ROUTES =================================== 
// === [R] display all orders for vendors ===
router.get('/', checkIfAuthenticated, async (req,res) => {

    let orders = await Order.collection().fetch({
        withRelated: ['orderItem', 'orderItem.gameListing', 'status'],
        require: true
    })

    // store orders in array 
    orders = Array.isArray(orders.toJSON())? orders.toJSON(): [orders.toJSON()]
    
    let filteredByVendorOrders = []
    // let filteredByVendorOrderItems = []
    for (let order of orders){
        // console.log(order.orderItem)
        for (let orderItem of order.orderItem){
            // console.log(orderItem)
            // console.log(orderItem.gameListing.vendor_id)
            if (orderItem.gameListing.vendor_id == req.session.vendor.id){
                filteredByVendorOrders.push(order)
                // filteredByVendorOrderItems.push(orderItem)
            }
        }
    }

    
    // console.log(filteredByVendorOrderItems)

    // let totalForEachOrder = []
    // for (let orderItem of filteredByVendorOrderItems){
    //         let total = orderItem.quantity * orderItem.unit_price
    //         totalForEachOrder.push(total)
    // }

    // for (let eachFilteredByVendorOrders of filteredByVendorOrders){
    //     for (let eachTotal of totalForEachOrder){
    //         eachFilteredByVendorOrders["total_per_vendor"] = eachTotal
    //     }
    // }
    

    // console.log(filteredByVendorOrders)
    // console.log(totalForEachOrder)

    // for (let order of filteredByVendorOrders){
    //     // console.log(order)
    //     for (let orderItem of order.orderItem){
    //         console.log(orderItem)
    //     }
    // }

    res.render('orders/index', {
        'orders':filteredByVendorOrders
        // 'totalForEachOrder': totalForEachOrder
    })
})

// === [R] display specific order ===
// 1. Render form
router.get('/:orderId', checkIfAuthenticated, async(req,res) => {
    let order = await Order.collection().where('id', req.params.orderId).fetchOne({
        withRelated: ['orderItem', 'orderItem.gameListing', 'status', 'user'],
        require: true
    })


    let orderItems = order.toJSON().orderItem
    let user = order.toJSON().user


    // fetch all statuses
    const allStatuses = await Status.fetchAll().map( status => [status.get('id'),status.get('name')])

    // caolan form
    const orderForm = updateOrderForm(allStatuses)

    // fill in existing status
    orderForm.fields.statuses.value = order.get('status_id')

    res.render('orders/details',{
        'order': order,
        'orderItems': orderItems,
        'user': user,
        'form': orderForm.toHTML(bootstrapField)
    })
})

// 2. Process form
router.post('/:orderId', checkIfAuthenticated, async(req,res) => {
    // get the order to update
    let order = await Order.collection().where('id', req.params.orderId).fetchOne({
        withRelated: ['orderItem', 'orderItem.gameListing', 'status', 'user'],
        require: true
    })

     // fetch all statuses
     const allStatuses = await Status.fetchAll().map( status => [status.get('id'),status.get('name')])
 
     // caolan form
     const orderForm = updateOrderForm(allStatuses)

     orderForm.handle(req, {
         'success': async(form) => {
             order.set('status_id', form.data.statuses)
             await order.save()
         },
         'error': async (form) => {
             res.render('orders/detail', {
                'order': order,
                'orderItems': orderItems,
                'user': user,
                'form': orderForm.toHTML(bootstrapField)
             }),
             req.flash('error_messages','There was an error when updating the order status. Please try again.')
         }
     })

     req.flash('success_messages','Status successfully updated!')
     res.redirect('/orders')


})

// === [D] Delete specific order ===
// 1. Render form 
router.get('/:orderId/delete', async(req,res) => {
    // fetch order to be deleted
    let order = await Order.collection().where('id', req.params.orderId).fetchOne({
        withRelated: ['orderItem', 'orderItem.gameListing', 'status', 'user'],
        require: true
    })

    res.render('orders/delete', {
        'order': order
    })
})

// 2. Process form
router.post('/:orderId/delete', async(req,res) => {
    // fetch order to be deleted
    let order = await Order.collection().where('id', req.params.orderId).fetchOne({
        withRelated: ['orderItem', 'orderItem.gameListing', 'status', 'user'],
        require: true
    })

    await order.destroy();

    req.flash('success_messages', 'Order has been successfully removed')
    res.redirect('/orders')

})

module.exports = router;
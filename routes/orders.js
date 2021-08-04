// =================================== IMPORTED =================================== 
// import express and express router
const express = require('express')
const router = express.Router();

// import model
const { Order, Status } = require('../models')

// import dal
const listingDataLayer = require('../dal/listings')

// import caolan form
const { bootstrapField, updateOrderForm, createSearchForm } = require('../forms');

// import middleware
const { checkIfAuthenticated } = require('../middlewares');

// =================================== ROUTES =================================== 
// === [R] display all orders for vendors ===
router.get('/', checkIfAuthenticated, async (req,res) => {

    // === Search Engine ===
    // fetch categories and populate form
    let allCategories = await listingDataLayer.getAllCategories()
    const orderSearchForm = createSearchForm(allCategories)


    // master query
    let q = Order.collection()

    orderSearchForm.handle(req, {
        'empty': async (form) => {
            let orders = await Order.collection().fetch({
                withRelated: ['orderItem', 'orderItem.gameListing', 'status'],
                require: true
            })
        
        
            // store orders in array 
            orders = Array.isArray(orders.toJSON())? orders.toJSON(): [orders.toJSON()]
            
        
            // get orders that contain games owned by vendor and calculate subtotal for the specific game
            let filteredByVendorOrders = []
        
        
            for (let order of orders){
                let filteredOrderItem = [];
                let subtotal = 0;
                for (let orderItem of order.orderItem){
                    if (orderItem.gameListing.vendor_id == req.session.vendor.id){
                        filteredOrderItem.push(orderItem);
                        subtotal += orderItem.quantity * orderItem.unit_price;
                    }
                }
                if(filteredOrderItem.length > 0){
                    order.orderItem = filteredOrderItem;
                    order["subtotal"] = subtotal;
                    filteredByVendorOrders.push(order);
                }
            }
        
        
            res.render('orders/index', {
                'orders':filteredByVendorOrders,
                'form': form.toHTML(bootstrapField)
            })
        },
        'error': async (form) => {
            
           
        },
        'success': async (form) => {
           
           
        }
    })


    let orders = await Order.collection().fetch({
        withRelated: ['orderItem', 'orderItem.gameListing', 'status'],
        require: true
    })


    // store orders in array 
    orders = Array.isArray(orders.toJSON())? orders.toJSON(): [orders.toJSON()]
    

    // get orders that contain games owned by vendor and calculate subtotal for the specific game
    let filteredByVendorOrders = []


    for (let order of orders){
        let filteredOrderItem = [];
        let subtotal = 0;
        for (let orderItem of order.orderItem){
            if (orderItem.gameListing.vendor_id == req.session.vendor.id){
                filteredOrderItem.push(orderItem);
                subtotal += orderItem.quantity * orderItem.unit_price;
            }
        }
        if(filteredOrderItem.length > 0){
            order.orderItem = filteredOrderItem;
            order["subtotal"] = subtotal;
            filteredByVendorOrders.push(order);
        }
    }


    res.render('orders/index', {
        'orders':filteredByVendorOrders
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

    let filteredOrders = []
    for (let item of orderItems){
        if (item.gameListing.vendor_id == req.session.vendor.id){
            filteredOrders.push(item)
        }
    }

    // console.log(orderItems)

    let user = order.toJSON().user


    // fetch all statuses
    const allStatuses = await Status.fetchAll().map( status => [status.get('id'),status.get('name')])

    // caolan form
    const orderForm = updateOrderForm(allStatuses)

    // fill in existing status
    orderForm.fields.statuses.value = order.get('status_id')

    res.render('orders/details',{
        'order': order,
        'orderItems': filteredOrders,
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
// =================================== IMPORTED =================================== 
// import express and express router
const express = require('express')
const router = express.Router();

// import model
const { Order, Status } = require('../models')

// import caolan form
const { bootstrapField, updateOrderForm, createOrdersSearchForm } = require('../forms');

// import middleware
const { checkIfAuthenticated } = require('../middlewares');

// =================================== ROUTES =================================== 
// === [R] display all orders for vendors ===
router.get('/', checkIfAuthenticated, async (req,res) => {

    // === Search Engine ===
    let allStatuses = await Status.fetchAll().map( status => [status.get('id'),status.get('name')])
    allStatuses.unshift([0, "--- All Statuses ---"])
    const orderSearchForm = createOrdersSearchForm(allStatuses)


    // master query
    let q = Order.collection()

    orderSearchForm.handle(req, {
        'empty': async (form) => {
            // case 1: searching on empty fields returns all result
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
                'orders':filteredByVendorOrders.reverse(),
                'form': form.toHTML(bootstrapField)
            })
        },
        'error': async (form) => {
            // 2. Case 2 - Invalid search field, returns all results with validation msg
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
                'orders':filteredByVendorOrders.reverse(),
                'form': form.toHTML(bootstrapField)
            })
           
        },
        'success': async (form) => {

            // === Search form ===

            // order id
            if (form.data.order_id) {
                q = q.where('id', '=', form.data.order_id)
            }

            // user id
            if (form.data.recipient_id) {
                q = q.where('user_id', '=', form.data.recipient_id)
            }

            // status
            if (form.data.status && form.data.status != "0"){
                q = q.where('status_id', '=', form.data.status)
            }

            

            let orders = await q.fetch({
                withRelated: ['orderItem', 'orderItem.gameListing', 'status']
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
                'orders':filteredByVendorOrders.reverse(),
                'form': form.toHTML(bootstrapField)
            })

           
        }
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


    let user = order.toJSON().user


    // fetch all statuses
    const allStatuses = await Status.fetchAll().map( status => [status.get('id'),status.get('name')])

    // caolan form (update status)
    const orderForm = updateOrderForm(allStatuses)

    // fill in existing status and user's address
    orderForm.fields.statuses.value = order.get('status_id')
    orderForm.fields.user_address.value = order.get("user_address")


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
             order.set('user_address', form.data.user_address)
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

     req.flash('success_messages','Order information successfully updated!')
     res.redirect('/orders')


})

// === [D] Delete specific order ===
// 1. Render form 
router.get('/:orderId/delete',checkIfAuthenticated, async(req,res) => {
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
router.post('/:orderId/delete',checkIfAuthenticated, async(req,res) => {
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
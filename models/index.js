const bookshelf = require('../bookshelf')

// User
const User = bookshelf.model('User', {
    tableName: 'users',
    cartItem() {
        return this.hasMany('CartItem')
    },
    order() {
        return this.hasMany('Order')
    }
})

// Vendor
const Vendor = bookshelf.model('Vendor', {
    tableName: 'vendors', 
    gameListing() {
        return this.hasMany('GameListing')
    }
})

// Category
const Category = bookshelf.model('Category', {
    tableName: 'categories',
    gameListing() {
        return this.belongsToMany('GameListing')
    }
})

// Status
const Status = bookshelf.model('Status', {
    tableName: 'statuses',
    order() {
        return this.belongsToMany('Order')
    }
})

// GameListing
const GameListing = bookshelf.model('GameListing', {
    tableName: 'gameListings',
    vendor() {
        return this.belongsTo('Vendor')
    },
    category() {
        return this.belongsToMany('Category')
    },
    cartItem() {
        return this.belongsToMany('CartItem')
    },
    orderItem() {
        return this.hasMany('OrderItem')
    }
})

// CartItem
const CartItem = bookshelf.model('CartItem', {
    tableName: 'cartItems',
    gameListing() {
        return this.belongsTo('GameListing')
    },
    user() {
        return this.belongsTo('User')
    }
})

// Order
const Order = bookshelf.model('Order', {
    tableName: 'orders',
    user() {
        return this.belongsTo('User')
    },
    status() {
        return this.hasOne('Status')
    },
    orderItem() {
        return this.hasMany('OrderItem')
    }
})

// OrderItem
const OrderItem = bookshelf.model('OrderItem', {
    tableName: 'orderItems',
    gameListing() {
        return this.hasOne('GameListing')
    },
    order() {
        return this.belongsTo('Order')
    }
})

module.exports = { User, Vendor, Category, Status, GameListing, CartItem, OrderItem, Order }
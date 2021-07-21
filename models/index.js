const bookshelf = require('../bookshelf')

// User
const User = bookshelf.model('User', {
    tableName: 'users',
    cartItem() {
        return this.hasMany('CartItem')
    },
    transaction() {
        return this.hasMany('Transaction')
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
    transaction() {
        return this.belongsToMany('Transaction')
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
    order() {
        return this.hasMany('Order')
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

// Transaction
const Transaction = bookshelf.model('Transaction', {
    tableName: 'transactions',
    user() {
        return this.belongsTo('User')
    },
    status() {
        return this.hasOne('Status')
    },
    order() {
        return this.hasMany('Order')
    }
})

// Order
const Order = bookshelf.model('Order', {
    tableName: 'orders',
    gameListing() {
        return this.hasOne('GameListing')
    },
    transaction() {
        return this.hasOne('Transaction')
    }
})

module.exports = { User, Vendor, Category, Status, GameListing, CartItem, Transaction, Order }
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
    game() {
        return this.hasMany('Game')
    }
})

// Category
const Category = bookshelf.model('Category', {
    tableName: 'categories',
    game() {
        return this.belongsToMany('Game')
    }
})

// Status
const Status = bookshelf.model('Status', {
    tableName: 'statuses',
    transaction() {
        return this.belongsToMany('Transaction')
    }
})

// Game
const Game = bookshelf.model('Game', {
    tableName: 'games',
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
    game() {
        return this.hasOne('Game')
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
    game() {
        return this.hasOne('Game')
    },
    transaction() {
        return this.hasOne('Transaction')
    }
})

module.exports = { Game, Vendor }
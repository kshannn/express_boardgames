const bookshelf = require('../bookshelf')

// User

// Vendor
const Vendor = bookshelf.model('Vendor', {
    tableName: 'vendors', 
    game() {
        return this.hasMany('Game')
    }
})

// Category

// Status

// Game
const Game = bookshelf.model('Game', {
    tableName: 'games',
    vendor() {
        return this.belongsTo('Vendor')
    }
})

// CartItem

// Transaction

module.exports = { Game, Vendor }
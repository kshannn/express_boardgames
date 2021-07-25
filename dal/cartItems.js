// =================================== IMPORTED =================================== 
// import model
const { CartItem } = require('../models')


// =============================== COMMON FUNCTIONS =============================== 

const getCartItemByGameIdAndUserId = async (gameId, userId) => {
    return await CartItem.where({
        'gameListing_id': gameId,
        'user_id': userId
    }).fetch({
        require: false
    })
}

const getCartItemByUserId = async(userId) => {
    return await CartItem.collection().where('user_id', userId).fetch({
        withRelated: ['gameListing']
    })
}

module.exports = { getCartItemByGameIdAndUserId, getCartItemByUserId }
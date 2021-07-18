// =================================== IMPORTED =================================== 
// import model
const { GameListing, Category } = require('../models')


// =============================== COMMON FUNCTIONS =============================== 

const getAllCategories = async () => {
    return await Category.fetchAll().map( category => [category.get('id'),category.get('name')])
}


const getGameListingById = async (listingId) => {
    return await GameListing.where('id',listingId).fetch({
        require: true,
        withRelated: ['category']
    })
}


module.exports = { getAllCategories, getGameListingById }
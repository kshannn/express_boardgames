// Setup database connection
// const knex = require('knex')({
//     client: {"ENV":"DB_DRIVER"},
//     connection: {
//         user:{"ENV": "DB_USER"},
//         password:{"ENV":"DB_PASSWORD"},
//         database":{"ENV":"DB_DATABASE"}
//     }
// })

const knex = require('knex')({
    client: {"ENV":"DB_DRIVER"},
    connection: {
        user:{"ENV": "DB_USER"},
        password:{"ENV":"DB_PASSWORD"},
        database:{"ENV":"DB_DATABASE"}
    }
})
const bookshelf = require('bookshelf')(knex)
module.exports = bookshelf;
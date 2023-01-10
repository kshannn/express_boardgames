const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
const cors = require('cors')
require("dotenv").config();


// create an instance of express app
let app = express();


// set the view engine
app.set("view engine", "hbs");


// static folder
app.use(express.static("public"));


// setup wax-on
wax.on(hbs.handlebars);
wax.setLayoutPath("./views/layouts");

var handlebars = require('handlebars-helpers');

handlebars({
    'handlebars':hbs.handlebars
}) 

// enable forms
app.use(
    express.urlencoded({
        extended: false
    })
);

// Enable CORS
app.use(cors())

// === sessions and flash messages ===
const session = require('express-session')
const flash = require('connect-flash')


// session file store
const FileStore = require('session-file-store')(session);

// set up sessions
app.use(session({
    'store': new FileStore({logFn: function(){}}),
    'secret': process.env.SESSION_SECRET,
    'resave': false,
    saveUninitialized: true
}))

// set up flash messages
app.use(flash())

// register flash middleware
app.use(function (req, res, next) {
    res.locals.success_messages = req.flash("success_messages");
    res.locals.error_messages = req.flash("error_messages");
    next();
});

// make vendor available to all HBS files by storing sessions in res.locals
app.use(function (req, res, next) {
    res.locals.vendor = req.session.vendor;
    next();
})

// import csurf
const csurf = require('csurf')

// enable CSRF
const csurfInstance = csurf();
app.use(function(req,res,next){
  // exclude api routes from CSRF protection (api authentication uses tokens instead)
  if (req.url === "/checkout/process_payment" || req.url.slice(0,5)==="/api/") {
    return next();
  }
  csurfInstance(req,res,next);
})

// share CSRF with hbs files
app.use(function (req, res, next) {
    if (req.csrfToken){
        res.locals.csrfToken = req.csrfToken();
    }
    next();
})




// import routes
const landingRoutes = require('./routes/landing')
const listingsRoutes = require('./routes/listings')
const authRoutes = require('./routes/auth')
const ordersRoutes = require('./routes/orders')

// import api routes
const api = {
    users: require('./routes/api/users'),
    cart: require('./routes/api/cart'),
    listings: require('./routes/api/listings'),
    checkout: require('./routes/api/checkout'),
    orders: require('./routes/api/orders')
}


async function main() {
    app.use('/', landingRoutes);
    app.use('/listings', listingsRoutes);
    app.use('/auth', authRoutes)
    app.use('/orders', ordersRoutes)
    app.use('/api/users', express.json(), api.users)
    app.use('/api/cart', express.json(), api.cart)
    app.use('/api/listings', express.json(), api.listings)
    app.use('/api/checkout', api.checkout)
    app.use('/api/orders', express.json(), api.orders)
}


main();


app.listen(process.env.PORT, () => {
    console.log("Server has started");
});
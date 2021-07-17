const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
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


// enable forms
app.use(
    express.urlencoded({
        extended: false
    })
);


// === sessions and flash messages ===
const session = require('express-session')
const flash = require('connect-flash')


// session file store
const FileStore = require('session-file-store')(session);

// set up sessions
app.use(session({
    'store': new FileStore(),
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


// import routes
const landingRoutes = require('./routes/landing')
const listingsRoutes = require('./routes/listings')
const authRoutes = require('./routes/auth')
const profileRoutes = require('./routes/profile')


async function main() {
    app.use('/', landingRoutes);
    app.use('/listings', listingsRoutes);
    app.use('/auth', authRoutes)
    app.use('/profile', profileRoutes)

}


main();


app.listen(3000, () => {
    console.log("Server has started");
});
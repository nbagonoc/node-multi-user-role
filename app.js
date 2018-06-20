const express = require("express");
const path = require("path");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const expressValidator = require("express-validator");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");

// initialize app
const app = express();

// static public directory
app.use(express.static(path.join(__dirname, "public")));

// Bring in models

// bring in db_secret config file
const db_secret = require("./config/db_secret");
// passport config
require("./config/passport")(passport);

// connect to mongoose
mongoose
  .connect(db_secret.mongoURI)
  .then(() => {
    console.log("we are connected to the database");
  })
  .catch(err => console.log(err));

// set templating engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// middlewares
// body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// method override middleware
app.use(methodOverride("_method"));
// express-session middleware
app.use(
  session({
    secret: db_secret.secretOrKey,
    resave: true,
    saveUninitialized: true
  })
);
// express-flash middleware
app.use(flash());
// express messages
app.use(require("connect-flash")());
app.use(function(req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});
// passport middleware
app.use(passport.initialize());
app.use(passport.session());
// express validator
app.use(expressValidator());

// Global user
app.get("*", function(req, res, next) {
  res.locals.user = req.user || null;
  next();
});

// index route
app.get("/", (req, res) => {
  res.render("index");
});

// bring in route files
const user = require("./routes/user");
app.use("/user", user);

// set port
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`we are live at ${port}`);
});

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const { ensureAuthenticated, isAdmin } = require("../guards/guard");

// load User Model
require("../models/User");
const User = mongoose.model("user");

// GET | register form
router.get("/register", (req, res) => {
  res.render("register");
});

// POST | Register a user
router.post("/register", (req, res) => {
  const { email, username, password, password2 } = req.body;

  // validator
  req.checkBody("email", "Email is required").notEmpty();
  req.checkBody("email", "Email is not valid").isEmail();
  req.checkBody("username", "Username is required").notEmpty();
  req.checkBody("password", "Password is required").notEmpty();
  req
    .checkBody("password2", "Password did not match")
    .equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    // return values, and do not create the user
    res.render("register", { errors, email, username, password, password2 });
  } else {
    // values are valid, check email from DB
    User.findOne({ email: req.body.email }).then(data => {
      if (data) {
        // email already exist
        req.flash("danger", "Email already exist");
        res.render("register", { email, username, password, password2 });
      } else {
        // values are valid, check username from DB
        User.findOne({ username: req.body.username }).then(data => {
          if (data) {
            // username already exist
            req.flash("danger", "Username already exist");
            res.render("register", { email, username, password, password2 });
          } else {
            // create user
            const newUser = new User({
              email,
              username,
              password
            });
            bcrypt.genSalt(10, function(err, salt) {
              bcrypt.hash(newUser.password, salt, (err, hash) => {
                if (err) {
                  console.log(err);
                }
                newUser.password = hash;
                newUser.save(err => {
                  if (err) {
                    console.log(err);
                    return;
                  } else {
                    req.flash("success", "You have successfully registered");
                    res.redirect("/user/login");
                  }
                });
              });
            });
          }
        });
      }
    });
  }
});

// GET | login route
router.get("/login", (req, res) => {
  res.render("login");
});

// POST | login process
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/user/dashboard",
    failureRedirect: "/user/login",
    failureFlash: true
  })(req, res, next);
});

// GET | Dashboard
router.get("/dashboard", ensureAuthenticated, (req, res) => {
  res.render("dashboard");
});

// GET | Admin Menu Page
router.get("/admin", ensureAuthenticated, isAdmin, (req, res) => {
  res.render("admin");
});

// GET | User Menu Page
router.get("/subscriber", ensureAuthenticated, (req, res) => {
  res.render("subscriber");
});

// GET | logout route
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success", "You are logged out");
  res.redirect("/user/login");
});

module.exports = router;

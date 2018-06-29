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

// GET | view all users
router.get("/", ensureAuthenticated, isAdmin, (req, res) => {
  User.find({ role: 0 })
    .sort({ _id: -1 })
    .then(users => {
      res.render("users", { users });
    })
    .catch(err => {
      if (err) {
        console.log(err);
      }
    });
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
                    res.redirect("/users/login");
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

// GET | edit user page
router.get("/edit/:id", ensureAuthenticated, (req, res) => {
  User.findOne({ _id: req.params.id })
    .then(data => {
      if (data.id == req.user._id || req.user.role === 1) {
        res.render("edit", { data });
      } else {
        req.flash("danger", "Not Authorized");
        return res.redirect("/users/dashboard");
      }
    })
    .catch(err => {
      console.log(err);
    });
});

// PATCH | edit user process
router.patch("/edit/:id", ensureAuthenticated, (req, res) => {
  User.findOne({ _id: req.params.id })
    .then(data => {
      data.fname = req.body.fname;
      data.lname = req.body.lname;
      data.address = req.body.address;
      data.phone = req.body.phone;

      // validator
      req.check("fname", "first name is required").notEmpty();
      req.check("lname", "last name is required").notEmpty();
      req.check("address", "address is required").notEmpty();
      req.check("phone", "phone is required").notEmpty();
      req.check("phone", "phone is not valid").isInt();
      req
        .check("phone", "phone must be 11 characters")
        .isLength({ min: 11, max: 11 });

      const errors = req.validationErrors();

      if (errors) {
        res.render("edit", { errors, data });
      } else {
        data
          .save()
          .then(updated => {
            req.flash("success", "Successfully edited profile");
            res.redirect(`/users/profile/${data.id}`);
          })
          .catch(err => {
            console.log(err);
          });
      }
    })
    .catch(err => {
      console.log(err);
    });
});

// DELETE | delete process
router.delete("/delete/:id", ensureAuthenticated, isAdmin, (req, res) => {
  User.findOne({ _id: req.params.id })
    .then(user => {
      user.remove();
      req.flash("success", "Successfully removed user");
      res.redirect("/users");
    })
    .catch(err => {
      if (err) {
        console.log(err);
      }
    });
});

// GET | login route
router.get("/login", (req, res) => {
  res.render("login");
});

// POST | login process
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/users/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true
  })(req, res, next);
});

// GET | Dashboard
router.get("/dashboard", ensureAuthenticated, (req, res) => {
  res.render("dashboard");
});

// GET | Profile
router.get("/profile/:id", ensureAuthenticated, (req, res) => {
  User.findOne({ _id: req.params.id })
    .then(data => {
      if (data.id == req.user._id || req.user.role === 1) {
        res.render("profile", { data });
      } else {
        req.flash("danger", "Not Authorized");
        return res.redirect("/users/dashboard");
      }
    })
    .catch(err => {
      if (err) {
        console.log(err);
      }
    });
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
  res.redirect("/users/login");
});

module.exports = router;

module.exports = {
  // Access control
  ensureAuthenticated: (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    } else {
      req.flash("danger", "Please login");
      res.redirect("/users/login");
    }
  },
  // checks the current user if admin
  isAdmin: (req, res, next) => {
    if (req.user.role == 1) {
      return next();
    } else {
      req.flash("danger", "Not Authorized");
      res.redirect("/users/dashboard");
    }
  }
};

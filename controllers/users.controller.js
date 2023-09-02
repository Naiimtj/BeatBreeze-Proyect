const User = require("../models/user.model");
const Playlist = require("../models/playlist.model");
const mongoose = require("mongoose");

module.exports.home = (req, res) => {
  res.render("home", {});
};
// REGISTRO
module.exports.register = (req, res, next) => res.render("users/register");

module.exports.doRegister = (req, res, next) => {
  User.findOne({ username: req.body.username })
    .then((user) => {
      if (user) {
        res.render("users/register", {
          user: req.body,
          errors: {
            username: "Username already exists",
          },
        });
      } else {
        return User.create(req.body).then(() => {
          req.flash("data", JSON.stringify({ info: "Please login in" }));
          res.redirect("/login");
        });
      }
    })
    .catch((error) => {
      console.error(error);
      if (error instanceof mongoose.Error.ValidationError) {
        res.render("users/register", { user: req.body, errors: error.errors });
      } else {
        next(error);
      }
    });
};
// LOGIN / LOGOUT
module.exports.login = (req, res, next) => res.render("users/login");

module.exports.doLogin = (req, res, next) => {
  function renderInvalidUsername() {
    res.render("users/login", {
      user: req.body,
      errors: {
        password: "Invalid username or password",
      },
    });
  }
  User.findOne({ username: req.body.username })
    .then((user) => {
      if (user) {
        return user.checkPassword(req.body.password).then((match) => {
          if (match) {
            req.session.userId = user.id;
            res.redirect("/profile");
          } else {
            renderInvalidUsername();
          }
        });
      } else {
        renderInvalidUsername();
      }
    })
    .catch((error) => {
      next(error);
    });
};

module.exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect("/login");
};

// PROFILE
module.exports.profile = (req, res, next) => {
  res.render("users/profile", { user: req.user });
};

const mongoose = require("mongoose");

// User Schema
const UserSchema = mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  role: {
    type: Number,
    default: 0
  },
  password: {
    type: String,
    required: true
  },
  fname: {
    type: String
  },
  lname: {
    type: String
  },
  address: {
    type: String
  },
  phone: {
    type: String
  }
});

const User = (module.exports = mongoose.model("user", UserSchema));

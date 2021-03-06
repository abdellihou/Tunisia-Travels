const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// Create the User Model
const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  file: {
    type: String,
  },
  bio: {
    type: String
  },
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpires: {
    type: Number,
  },
  show: false
});
module.exports = User = mongoose.model("users", UserSchema);


const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  UserName: {
    type: String,
    required: [true, "Username is required"],
    unique: true,
    trim: true,
  },

  Email: {
    type: String,
    required: true,
    unique: true,
  },

  Password: {
    required: [true, "Password is required"],
    type: String
  },
  Address: {
    required: true, type: String
  },
  phone: {
    type: String,
    required: [true, "[Phone number is required"]
  },
  Usertype: {
    type: String,
    required: [true, "User type is required"],
    default: "Customer",
    enum: ["Customer","Owner"]
  },

  Profile: {
    type: String,
    default: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
  }, 
  OTP:{
  type: Number
}
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);

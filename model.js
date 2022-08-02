const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
// const SECRET_KEY = process.env.SECRET_KEY;
const dataSchema = new mongoose.Schema({
  email: {
    required: true,
    type: String,
  },
  full_name: {
    required: true,
    type: String,
  },
  phone: {
    required: true,
    type: String,
  },
  password: {
    required: true,
    type: String,
  },
});

//hashing password
dataSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    // console.log("hello")
    this.password = await bcrypt.hash(this.password, 12);
    // this.password=bcrypt.hash(this.password,12);
  }
  next();
});
// dataSchema.methods.generateAuthToken = async function (id) {
//   try {
//     let token = jwt.sign({ user_id: id }, process.env.SECRET_KEY, {
//       expiresIn: "1d",
//     });
//     return token;
//   } catch (error) {
//     console.log(error);
//   }
// };

const User = mongoose.model("USER", dataSchema);
module.exports = User;

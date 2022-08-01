const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
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

const User = mongoose.model("USER", dataSchema);
module.exports = User;

const mongoose = require("mongoose");
const User = require("./model");

const profileSchema = new mongoose.Schema({
  profile_pic: {
    type: String,
    require: true,
  },
  filename: { type: String, required: true },
  path: { type: String, required: true },
  url: { type: String, required: false },
  size: { type: Number, required: true },
  uuid: { type: String, required: true },
  profile_details: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User,
  },
});

profileSchema.pre("save", async function (next) {
  if (this.isModified("uuid")) {
    console.log("hello");
    this.url = `http://localhost:3000/${this.uuid}`;
    // this.password=bcrypt.hash(this.password,12);
  }
  next();
});
const UserProfile = mongoose.model("UserProfile", profileSchema);
module.exports = UserProfile;

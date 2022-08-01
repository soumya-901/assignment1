const express = require("express");
const mongoose = require("mongoose");
const Model = require("./model");
const bcrypt = require("bcryptjs");

require("dotenv").config();
const PORT = process.env.port || 3000;
const DB = process.env.db;
const app = express();
app.use(express.json());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

//connect to mongo db
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("data base connect successfully");
  })
  .catch((err) => {
    console.log(err);
  });

app.get("/", (req, res) => {
  res.json({ data: "succesfull acknowledgement" });
});
// sign in
app.post("/signup", async (req, res) => {
  try {
    const userExist = await Model.findOne({ email: req.body.email });
    if (userExist) {
      return res.status(422).json({ message: "user name is already exit" });
    }
    const data = new Model({
      full_name: req.body.fullName,
      email: req.body.email,
      phone: req.body.phone,
      password: req.body.password,
    });
    const dataToSave = await data.save();
    res.status(200).json({ message: "succesfull" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
// sign in
app.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const userExist = await Model.findOne({ email: email });
    if (userExist) {
      // console.log(userExist.password)
      const ismatch = await bcrypt.compare(password, userExist.password);
      if (ismatch) {
        res.json({ message: "success" });
      } else {
        res.json({ error: "password did'nt match" });
      }
    } else {
      res.json({ user: "invalid user" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//Running server in 3000
app.listen(PORT, () => {
  console.log(`server is running at ${PORT}`);
});

const express = require("express");
const mongoose = require("mongoose");
const Model = require("./model");
const bcrypt = require("bcryptjs");
const UserProfile = require("./userprofile");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();
const PORT = process.env.port || 3000;
const DB = process.env.db;
const app = express();
app.use(express.json());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
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
      full_name: req.body.full_name,
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
app.patch("/updateprofile", verifyToken, async (req, res) => {
  try {
    const result = await Model.findByIdAndUpdate(
      { _id: req.name.user_id },
      {
        $set: {
          full_name: req.body.full_name,
          phone: req.body.phone,
          email: req.body.email,
        },
      },
      {
        new: true,
        useFindAndModify: false,
      }
    );
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.json({ err: "can't update" });
  }
});
app.post("/profile", verifyToken, async (req, res) => {
  let storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  });
  let imageupload = multer({
    storage,
    limits: { fileSize: 1000000 * 100 },
  }).single("filename");
  try {
    imageupload(req, res, async (err) => {
      if (err) {
        console.log(err);
        return res.status(500).send({ error: err.message });
      }
      const userExist = await Model.findById(req.name.user_id);
      if (!userExist) {
        return res.status(422).json({ message: "account not found" });
      }
      const data = new UserProfile({
        profile_pic: req.body.profilename,
        filename: req.file.filename,
        uuid: uuidv4(),
        path: req.file.path,
        size: req.file.size,
        profile_details: req.name.user_id,
      });
      const dataToSave = await data.save();
      res.status(200).json({ message: "succesfull", data: dataToSave });
    });
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
        const token = generateAuthToken(userExist._id);
        console.log(token);
        // const check = await userExist.checktoken(token);
        // console.log(check._id);
        res.cookie("jwt_web_token", token, {
          expires: new Date(Date.now() + 40000),
          httpOnly: true,
        });
        res.status(200).json({ message: "success" });
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
app.get("/allUser", async (req, res) => {
  const allUser = await Model.find();
  res.status(200).json(allUser);
});

app.get("/userProfiles", async (req, res) => {
  try {
    const alluserProfile = await UserProfile.find().populate("profile_details");
    res.status(200).json(alluserProfile);
  } catch (error) {
    console.log(error);
  }
});

function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.json({ token: "Please login to get Access_token" });
  }
  jwt.verify(token, process.env.SECRET_KEY, (err, user_id) => {
    if (err) {
      return res.redirect("/");
    } else {
      req.name = user_id;
      // console.log(user_id)
      next();
    }
  });
}

function generateAuthToken(id) {
  try {
    let token = jwt.sign({ user_id: id }, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });
    return token;
  } catch (error) {
    console.log(error);
  }
}

//Running server in 3000
app.listen(PORT, () => {
  console.log(`server is running at ${PORT}`);
});

//jshint esversion:6

require('dotenv').config();
const express = require("express");
const ejs = require("ejs");
const mg = require("mongoose");
const encrypt = require("mongoose-encryption");
const app = express();

app.use(express.static("public"));

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
mg.connect("mongodb://localhost:27017/userDb", { useNewUrlParser: true });



const userSchema = new mg.Schema({
    email: String,
    password: String
});

userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] });

const User = mg.model("User", userSchema);
app.get("/", function (req, res) {
    res.render("home");
});

app.get("/login", function (req, res) {
    res.render("login");
});


app.get("/register", function (req, res) {
    res.render("register");
});

app.get("/submit", function (req, res) {
    res.render("submit");
});



app.post("/register", function (req, res) {

    // console.log(req.body);
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });

    newUser.save(function (err) {
        if (!err) {
            console.log("User successfully added!");
            res.render("secrets");
        } else {
            console.log(err);
        }
    });
});


app.post("/login", function (req, res) {
    User.findOne({ email: req.body.username },
        function (err, userDetails) {
            if (!err) {
                if (userDetails) {
                    if (userDetails.password === req.body.password) {
                        console.log("User found and authenticated to use the app");
                        res.render("secrets");
                    } else {
                        console.log("User found but password didn't match");
                    }
                }
            } else {
                console.log(err);
            }
        });
});


app.listen(process.env.PORT || 3000, function () {
    console.log("Server is running on port 3000");
})


//jshint esversion:6

require('dotenv').config();
const express = require("express");
const ejs = require("ejs");
const mg = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.use(express.static("public"));

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));


app.set('trust proxy', 1) // trust first proxy
app.use(session({
    secret: "i do like it",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());



mg.connect("mongodb://localhost:27017/userDb", { useNewUrlParser: true });



const userSchema = new mg.Schema({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

const User = mg.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});


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

app.get("/secrets", function (req, res) {
    if (req.isAuthenticated()) {
        res.render("secrets");
    } else {
        console.log("User is not authenticated");
        res.redirect("/login");
    }
});

app.get("/logout", function (req, res) {
    req.logOut();
    res.redirect("/");
});

app.post("/register", function (req, res) {
    User.register({ username: req.body.username }, req.body.password, function (err, userResult) {
        if (err) {
            console.log(err);
            res.redirect("/register");
        } else {
            console.log("Authenticating User!");
            passport.authenticate("local")(req, res, function () {
                res.redirect("/secrets");
            });
        }
    });
});


app.post("/login", function (req, res) {
    const newUser = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(newUser, function (err) {
        if (err) {
            console.log(err);
            res.redirect("/login");
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/secrets");
            });
        }
    });
});


app.listen(process.env.PORT || 3000, function () {
    console.log("Server is running on port 3000");
})


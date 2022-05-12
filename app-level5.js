const express = require('express');
const ejs=require('ejs');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const passportlocalmongoose = require('passport-local-mongoose');




const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(session({
     secret: "our little secret.",
     resave: false,
     saveUninitialized: false
})); 
app.use(passport.initialize());
app.use(passport.session());
mongoose.connect("mongodb://localhost:27017/secretsDB",{useNewUrlParser:true});

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    secret: String
});
userSchema.plugin(passportlocalmongoose)

const userModel = mongoose.model("Usercollection", userSchema);
passport.use(userModel.createStrategy());
passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());  

app.get("/", (req, res) => {
    console.log("level5")
    res.render("home");
})
app.get("/login", (req, res) => {
    res.render("login");
})
app.get("/register", (req, res) => {
    res.render("register");
})
app.get("/secrets", (req, res) => {
    if (req.isAuthenticated()) {
        userModel.find({"secret" : {$ne:null}} ,(err, data) => {
            if(err)
            {
                console.log(err);
            }
            else
            {

                res.render("secrets", {usersWithSecrets : data});
            }

        })
    }
    else
    {
        res.redirect("/login");
    }
})
app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
})
app.get("/submit", (req, res) => {
    if (req.isAuthenticated)
    {
        res.render("submit");
    }
    else
    {
        res.redirect("/login");
    }
})
app.post("/submit", (req, res) => {
    const secret = req.body.secret;
    console.log(req.user);
    console.log(req.user._id);
    //_id
    // res.send(req.user);
    userModel.findById(req.user._id, (err, data) => {
        if (err) {
            console.log(err);
        }
        else
        {
            if (data)
            {
                data.secret = secret;
                data.save(() => {
                    res.redirect("/secrets"); 
                });
            }
        }
    })
})

app.post("/register", (req, res) => {
    userModel.register({username: req.body.username}, req.body.password, (err, data) => {
        if (err) {
            console.log(err);
            res.redirect("/register");
        }
        else
        {
            passport.authenticate("local")(req, res, () => {
                res.redirect("/secrets");
            })
        }
    })
})
app.post("/login", (req, res) => {
    const user = new userModel({
        username: req.body.username,
        password: req.body.password
    })
    req.login(user, (err) => {
        if(err)
        {
            console.log(err);
        }
        else
        {
            passport.authenticate("local")(req, res, () => {
                res.redirect("/secrets");
            })
        }
    })
})

app.listen(3000, () => {
    console.log("listening on port 3000")
});
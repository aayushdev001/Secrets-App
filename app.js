const express = require('express');
const ejs=require('ejs');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');


const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/secretsDB",{useNewUrlParser:true});

const userSchema = {
    email: String,
    password: String
}
const userModel = mongoose.model("Usercollection", userSchema);

app.get("/", (req, res) => {
    res.render("home");
})
app.get("/login", (req, res) => {
    res.render("login");
})
app.get("/register", (req, res) => {
    res.render("register");
})


app.post("/register", (req, res) => {
    newUser = new userModel({
        email: req.body.username,
        password:req.body.password
    })
    newUser.save((err) => {
        if (err){
            console.log(err);
        }
        else
        {
            res.render("secrets");
        }
    });
})
app.post("/login", (req, res) => {
    userModel.findOne({email:req.body.username},(err, data) => {
        if (err){
            console.log(err);
        }
        else
        {
            if (data.password === req.body.password)
            {
                res.render("secrets");
            }
        }
    })
})

app.listen(3000, () => {
    console.log("listening on port 3000")
});
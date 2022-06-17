//jshint esversion:6
const express = require("express");
const ejs = require("ejs");
const datacontroller = require("./datacontroller/controller");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

//to view templates
app.set("view engine", "ejs");

app.use(express.static("public"));


app.use(session({
    secret: 'Write Your Secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
  }));

app.use(passport.initialize());
app.use(passport.session());

//fire controller
datacontroller(app);



app.listen(process.env.PORT || 3000,function(req,res){
    console.log("server running on port 3000.!");
});

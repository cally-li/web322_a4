
/*********************************************************************************
*  WEB322 – Assignment 4
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  
*  No part of this assignment has been copied manually or electronically from any other source
*  (including web sites) or distributed to other students.
* 
*  Name: ________Cally Li____________ Student ID: _175730217_________ Date: ____October 14, 2022_______
*
*  Online (Cyclic) URL:  https://uptight-loafers-duck.cyclic.app
*
********************************************************************************/ 

const express = require("express");
const path = require("path");
const multer = require("multer");
const dataService= require("./data-service.js"); 
const fs = require('fs');
const exphbs = require("express-handlebars");


var app = express();

var HTTP_PORT = process.env.PORT || 8080;

//return static css file
app.use(express.static("public")); 

// use middleware: Express built-in "bodyParser" - to access form data in http body
app.use(express.urlencoded({ extended: true }));

// add the property "activeRoute" to "app.locals" whenever the route changes, ie: if our route is "/students/add", the app.locals.activeRoute value will be "/students/add".
app.use(function(req, res, next){
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();
});


// call this function after the http server starts listening for requests
function onHttpStart() {
  console.log("Express http server listening on port " + HTTP_PORT);
}

// Register handlebars as the rendering engine for views, register template engine helpers
app.engine(".hbs", exphbs.engine({ 
    extname: ".hbs",
    helpers: {
        navLink: function(url, options){
            return '<li' + 
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
                '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }
    }
    
 }));
app.set("view engine", ".hbs");

const storage = multer.diskStorage({
    destination: "./public/images/uploaded",
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
    }
  });
  
// tell multer to use the diskStorage function for naming files instead of the default.
const upload = multer({ storage: storage });


//ROUTES
app.get("/", function(req,res){
    res.render('home');
});

app.get("/about", function(req,res){
    res.render('about');
});

app.get("/students", function(req,res){
    if(req.query.status) {
        dataService.getStudentsByStatus(req.query.status)
        .then((data)=>res.render("students", {students: data})) 
        .catch(()=>res.render("students", {message: "no results"}));
    }else if(req.query.program){
        dataService.getStudentsByProgramCode(req.query.program)
        .then((data)=>res.render("students", {students: data})) 
        .catch(()=>res.render("students", {message: "no results"}));
    }else if(req.query.credential){
        dataService.getStudentsByExpectedCredential(req.query.credential)
        .then((data)=>res.render("students", {students: data})) 
        .catch(()=>res.render("students", {message: "no results"}));
    }else{
        dataService.getAllStudents()
        .then((data)=>res.render("students", {students: data})) 
        .catch(()=>res.render("students", {message: "no results"}));
    }

});

app.get("/student/:value", (req,res) => {
    dataService.getStudentById(req.params.value)
    .then((data)=>res.render("student", { student: data })) 
    .catch(()=>res.render("student",{message: "no results"}));
});

app.post("/student/update", (req, res) => {
    dataService.updateStudent(req.body)
    .then(()=>res.redirect("/students")) 
    .catch((err)=>res.json( {message : err}));
});

app.get("/intlstudents", function(req,res){
    dataService.getInternationalStudents()
    .then((data)=>res.json(data)) 
    .catch((err)=>res.json( {message : err}));
});

app.get("/programs", function(req,res){
    dataService.getPrograms()
    .then((data)=>res.render("programs", {programs: data})) 
    .catch(()=>res.render("programs", {message: "no results"}));
});

app.get("/students/add", function(req,res){
    res.render('addStudent');
});

app.post("/students/add", upload.single("imageFile"), (req, res) => {
    dataService.addStudent(req.body)
    .then(()=>res.redirect("/students")) 
    .catch((err)=>res.json( {message : err}));
});

app.get("/images/add", function(req,res){
    res.render('addImage');
});

//multer single function takes the value of the 'name' attribute on the form
app.post("/images/add", upload.single("imageFile"), (req, res) => {
    res.redirect("/images");
});

app.get("/images", function(req,res){
    return new Promise ((resolve, reject)=>{
        fs.readdir(path.join(__dirname,"/public/images/uploaded"), function(err, contents) {
            if (err) {
                reject(err); return;
            } else {
                resolve(contents); //return array of files in directory
            }
      });
    })
    .then((imagesArr)=> res.render("images", {data : imagesArr})) //send image urls to images.hbs
    .catch((err)=>res.json( {message : err}));
});

app.use((req, res) => {
    res.status(404).send("Page Not Found");
  });


//read json files into global array objects before starting server  
dataService.initialize()
.then(()=>{
    //start server after initialized successfully
    app.listen(HTTP_PORT, onHttpStart);
})
.catch((err)=>{
    console.log("Error:",err);
});
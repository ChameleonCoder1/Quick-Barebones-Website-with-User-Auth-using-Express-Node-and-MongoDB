const express = require('express');

const app = express();
const mongoose      = require("mongoose"),
      bodyParser    = require("body-parser");

var passport                = require("passport"),
    crypto                  = require("crypto"),
    expressSanitizer        = require("express-sanitizer"),
    LocalStrategy           = require("passport-local"),
    methodOverride          = require("method-override"),
    flash                   = require("connect-flash");
var passportLocalMongoose   = require("passport-local-mongoose");


    //var methodOverride          = require("method-override");

var Post                    = require("./models/post.js");
var Company                 = require("./models/company.js");
//By default, this will get the index.js file in ./middleware/
var middleware              = require("./middleware");

mongoose.connect("mongodb://localhost:27017/quick_starter_code_api", { useNewUrlParser: true });
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

app.use(bodyParser.urlencoded({ extended:true }));

app.use(flash());

// By having this next line of code, we get served the public directory, so
// if we call something in the ~/public/ then we don't have to put the public part...
// in header.ejs, the /mythoughtweb.css reference uses this
app.use(express.static("public"));

// This next code is used to encode the sessions...sessions are how passport tells if a
// company is logged-in. So this code is actually two steps in one...we are requiring
// a package and at the same time sending it 3 arguments to tell it how to run
// the express session and encode the sessions...
// the "secret" argument is used to encode and decode the sessions, and it can be anything.
app.use(require("express-session")({
    secret: "Hey ma what up",
    resave: false,
    saveUninitialized: false
}));

// We need these two lines anytime we use passport. It tells express to use passport.
app.use(passport.initialize());
app.use(passport.session());

// The next line of code allows us to authenticate companies for when we have the POST
// request for the "/login" route. This authenticate() method codes from passportLocalMongoose.
// It just tells passport that for our LocalStrategy authentication, we will using the
// particular method of .authenticate(), which was created for us.
    passport.use(new LocalStrategy(Company.authenticate()));







    // The next two lines are responsible for reading the session by taking the data
    // from the session and unencoding it (deserialize)...or encoding the data and
    // putting it back in the session (serialize). These methods were made available
    // to us because we included the passportLocalMongoose plugin in company.js...here,
    // we are just telling passport what to run (Company.serializeUser), for example),
    // whenever we call the passport.serializeUser() method on passport object.
        passport.serializeUser(Company.serializeUser());
        passport.deserializeUser(Company.deserializeUser());



        //This passes currentCompany to every single child template.
        app.use(function(req,res,next){
            res.locals.currentCompany=req.user;
            res.locals.error=req.flash("error");
            res.locals.success=req.flash("success");
        next();
    });
    //^Whatever we put in res.locals is available inside of our template (I
    //believe this is defining currentCompany=req.user for this entire app.js file
    //and so when we route to anywhere, this currentCompany variable gets
    //automatically exported since the route is a child process off of mythoughtweb.js)

    app.use(methodOverride("_method"));
    app.use(expressSanitizer());







app.get("/", function(req, res){
        res.render("home.ejs");
    });

// =======================================
//             RESTful Routes
// =======================================


// READ Route (used by React Native app)
app.get('/api/read', (req,res) => {
    Post.find({}, (err,allposts) =>{
        if(err){
            console.log(err)
        } else {
            res.json(allposts)
        }
    });
});

// app.get('/api/read', (req, res) => {
//     const restaurants =[
//       {id: 1, title: 'Company 1', location: '123 Main St', thumbnail_image:'some_image.jpg', url:'https://google.com/'},
//       {id: 2, title: 'Company 2', location: '123 Main St', thumbnail_image:'some_image.jpg', url:'https://google.com/'},
//       {id: 3, title: 'Company 3', location:'123 Main St', thumbnail_image:'some_image.jpg', url:'https://google.com/'},
//       {id: 4, title: 'Company 4', location:'123 Main St', thumbnail_image:'some_image.jpg', url:'https://google.com/'}
//
//     ];
//
//     res.json(restaurants);
//
// });


// CREATE Routes (Used by a web route that is only known internally)

    //New Route
    app.get("/add/company/new", function(req,res){
        res.render("new.ejs");
    });



    //Create Route
    app.post("/add/company/new", function(req,res){

                req.body.username=req.sanitize(req.body.username);
                req.body.password=req.sanitize(req.body.password);

                // Make a new Company object...We feed the req.body.username as the username field in the
                // database, but notice that req.body.password isn't getting sent to this object directly, it is being
                // sent instead as an argument to the .register method. Note: this line doesn't yet save it to the database!
                // It is not a good idea to save passwords to a database because of privacy...so what this does
                // is send the password as a second argument and Company.register will hash this password
                // (turns it into a huge string of numbers and letters) for the username that passed it and it created.
                // As a result, it will return a new company whose data we can refer to (thanks to the callback function) as
                // "company" that has a username and the hashed password.
                Company.register(new Company ({username: req.body.username}), req.body.password, function(err, company){
                    if(err){
                        req.flash("error", err.message);
                        return res.render("new.ejs");
                    } else {

                        // If company was successfully created from the above code, passport.authenticate will
                        // log the company in, take care of everything in the session, run the serializeUser method, etc.
                        // Note: Here, we are using the "local" passport strategy, but we could also have used "twitter" or "facebook" etc. Also note: for twitter and facebook and most other strategies
                        // besides "local", we have to register our apps with these companies and get credentials...it is a
                        // little more complicated than "local"
                        passport.authenticate("local")(req, res, function(){
                            var newPost = {
                                city: " ",
                                company_name: " ",
                                location: " ",
                                thumbnail_image: " ",
                                url: " ",
                                company:  company._id
                            };
                            Post.create(newPost, function(err,thispost){
                                if(err){
                                    console.log(err);
                                } else {
                                    Company.findByIdAndUpdate(company._id, {postofcompany: thispost._id}, function(err, updatedCompany){
                                        if(err){
                                            res.redirect("/");
                                        } else {
                                            req.flash("success", "Sign up successful. Welcome to A Quick Website ");
                                            res.redirect("/");
                                        }
                                    });

                                    }
                            });
                        });
                    }
                });


    });



// UPDATE Routes (Used by a web route that is only known internally)

    //Edit route:
//    app.get("/update/:id/", middleware.checkCompanyOwnership, function(req,res){
//        Company.findById(req.params.id).populate("postofcompany").exec(function(err,foundCompany){
//            if(err){
//                res.redirect("/");
//            } else {
//                res.render("edit.ejs", {thisCompany:foundCompany} );
//            }
//        });
//    });

    app.get("/update/:id", middleware.checkCompanyOwnership , function(req,res){
        Post.findById( req.params.id , function(err,foundPost){
            if(err){
                res.redirect("/");
            } else {
                res.render("edit.ejs", {thisPost:foundPost} );
            }
        });
    });


    //Update route:
    app.put("/update/:id", middleware.isLoggedIn, function(req,res){
        req.body.city=req.sanitize(req.body.city);
        req.body.company_name=req.sanitize(req.body.company_name);
        req.body.location=req.sanitize(req.body.location);
        req.body.thumbnail_image=req.sanitize(req.body.thumbnail_image);
        req.body.url=req.sanitize(req.body.url);

        var newPost = {
            city: req.body.city,
            company_name: req.body.company_name,
            location: req.body.location,
            thumbnail_image: req.body.thumbnail_image,
            url: req.body.url
        };

        Post.findByIdAndUpdate(req.params.id, newPost , function(err, updatedPost){
            if(err){
                console.log(err);
                res.redirect("/");
            } else {
                req.flash("success", "Update successful.");
                res.redirect("/update/" + req.params.id  );
            }
        });
    });



// DESTROY Route
app.delete("/company/:id", middleware.isLoggedIn, function(req,res){
    Post.findByIdAndRemove(req.params.id, function(err){
       if(err){
           req.flash("error", "Delete unsuccessful.");
           res.redirect("/add/company/new");
       } else {
           req.flash("success", "Delete successful.");
           res.redirect("/add/company/new");
       }
    });
});








// =======================================
//          Authentication Routes
// =======================================

// login form
app.get("/login", function(req, res){
    res.render("login.ejs");
});

// Note: Here, we are using the "local" passport strategy, but we could also have used "twitter" or "facebook" etc. Also note: for twitter and facebook and most other strategies
// besides "local", we have to register our apps with these companies and get credentials...it is a
// little more complicated than "local"
app.post("/login", passport.authenticate("local", {successRedirect: "/",failureRedirect: "/login"}), function(req, res){
});

app.get("/logout", function(req,res){
    req.logout();
    req.flash("success", "Logged out!");
    res.redirect("/");
});









const port = 5000;

app.listen(port, function(err){
    if(err){
        console.log(err);
        } else {
        console.log("Server has started!!!");
        }
});

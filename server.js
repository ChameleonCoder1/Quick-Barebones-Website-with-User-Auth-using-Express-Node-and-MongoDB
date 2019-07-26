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
var User                    = require("./models/user.js");
//By default, this will get the index.js file in ./middleware/
var middleware              = require("./middleware");

mongoose.connect("mongodb://localhost:27017/mooch_api", { useNewUrlParser: true });
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
// user is logged-in. So this code is actually two steps in one...we are requiring
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

// The next line of code allows us to authenticate users for when we have the POST
// request for the "/login" route. This authenticate() method codes from passportLocalMongoose.
// It just tells passport that for our LocalStrategy authentication, we will using the
// particular method of .authenticate(), which was created for us.
    passport.use(new LocalStrategy(User.authenticate()));







    // The next two lines are responsible for reading the session by taking the data
    // from the session and unencoding it (deserialize)...or encoding the data and
    // putting it back in the session (serialize). These methods were made available
    // to us because we included the passportLocalMongoose plugin in user.js...here,
    // we are just telling passport what to run (User.serializeUser(), for example),
    // whenever we call the passport.serializeUser() method on passport object.
        passport.serializeUser(User.serializeUser());
        passport.deserializeUser(User.deserializeUser());



        //This passes currentUser to every single child template.
        app.use(function(req,res,next){
            res.locals.currentUser=req.user;
            res.locals.error=req.flash("error");
            res.locals.success=req.flash("success");
        next();
    });
    //^Whatever we put in res.locals is available inside of our template (I
    //believe this is defining currentUser=req.user for this entire app.js file
    //and so when we route to anywhere, this currentUser variable gets
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
app.get('/api/restaurants', (req,res) => {
    Post.find({}, (err,allposts) =>{
        if(err){
            console.log(err)
        } else {
            res.json(allposts)
        }
    });
});

// app.get('/api/restaurants', (req, res) => {
//     const restaurants =[
//       {id: 1, title: 'Beer Garden', location: '614 Glenwood Ave, Raleigh, NC 27603', thumbnail_image:'/Users/nweimer/Desktop/mooch_photos/raleigh_beer_garden_thumbnail.jpg', url:'https://www.theraleighbeergarden.com/'},
//       {id: 2, title: 'St. Rochs Oyster Bar', location: '223 S Wilmington St, Raleigh, NC 27601', thumbnail_image:'/Users/nweimer/Desktop/mooch_photos/st_roch_oyster_bar_thumbnail.jpg', url:'https://www.strochraleigh.com/'},
//       {id: 3, title: 'Brewery Bhavana', location:'218 S Blount St, Raleigh, NC 27601', thumbnail_image:'/Users/nweimer/Desktop/mooch_photos/brewery_bhavana_thumbnail.jpg', url:'https://brewerybhavana.com/'},
//       {id: 4, title: '42nd Street Oyster Bar', location:'508 W Jones St, Raleigh, NC 27603', thumbnail_image:'/Users/nweimer/Desktop/mooch_photos/42nd_street_oyster_bar_thumbnail.jpg', url:'https://www.42ndstoysterbar.com/'}
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

                // Make a new User object...We feed the req.body.username as the username field in the
                // database, but notice that req.body.password isn't getting sent to this object directly, it is being
                // sent instead as an argument to the .register method. Note: this line doesn't yet save it to the database!
                // It is not a good idea to save passwords to a database because of privacy...so what this does
                // is send the password as a second argument and User.register will hash this password
                // (turns it into a huge string of numbers and letters) for the username that passed it and it created.
                // As a result, it will return a new user whose data we can refer to (thanks to the callback function) as
                // "user" that has a username and the hashed password.
                User.register(new User ({username: req.body.username}), req.body.password, function(err, user){
                    if(err){
                        req.flash("error", err.message);
                        return res.render("new.ejs");
                    } else {

                        // If user was successfully created from the above code, passport.authenticate will
                        // log the user in, take care of everything in the session, run the serializeUser method, etc.
                        // And after this is done, redirect them to the "/secret" page (BUT, the "/secret" page
                        // can be reached if a user is logged in or not! In order to fix this, we added our own
                        // middleware function called isLoggedIn below and ran that middleware whenever a GET request
                        // is made to "/secret").
                        // Note: Here, we are using the "local" strategy, but we could also have used "twitter" or
                        // "facebook" etc. Also note: for twitter and facebook and most other strategies besides
                        // "local", we have to register our apps with these companies and get credentials...it is a
                        // little more complicated than "local"
                        // NOTE: We will need to add a way to notify the user if the username is already taken
                        passport.authenticate("local")(req, res, function(){
                            var newPost = {
                                city: " ",
                                restaurant_name: " ",
                                location: " ",
                                thumbnail_image: " ",
                                url: " ",
                                sunday_drink: " ",
                                sunday_food: " ",
                                sunday_event: " ",
                                monday_drink: " ",
                                monday_food: " ",
                                monday_event: " ",
                                tuesday_drink: " ",
                                tuesday_food: " ",
                                tuesday_event: " ",
                                wednesday_drink: " ",
                                wednesday_food: " ",
                                wednesday_event: " ",
                                thursday_drink: " ",
                                thursday_food: " ",
                                thursday_event: " ",
                                friday_drink: " ",
                                friday_food: " ",
                                friday_event: " ",
                                saturday_drink: " ",
                                saturday_food: " ",
                                saturday_event: " ",
                                user:  user._id
                            };
                            Post.create(newPost, function(err,thispost){
                                if(err){
                                    console.log(err);
                                } else {
                                    User.findByIdAndUpdate(user._id, {postofuser: thispost._id}, function(err, updatedUser){
                                        if(err){
                                            res.redirect("/");
                                        } else {
                                            req.flash("success", "Sign up successful. Welcome to Mooch ");
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
//    app.get("/update/:id/", middleware.checkUserOwnership, function(req,res){
//        User.findById(req.params.id).populate("postofuser").exec(function(err,foundUser){
//            if(err){
//                res.redirect("/");
//            } else {
//                res.render("edit.ejs", {thisUser:foundUser} );
//            }
//        });
//    });

    app.get("/update/:id", middleware.checkUserOwnership , function(req,res){
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
        req.body.restaurant_name=req.sanitize(req.body.restaurant_name);
        req.body.location=req.sanitize(req.body.location);
        req.body.thumbnail_image=req.sanitize(req.body.thumbnail_image);
        req.body.url=req.sanitize(req.body.url);
        req.body.sunday_drink=req.sanitize(req.body.sunday_drink);
        req.body.sunday_food=req.sanitize(req.body.sunday_food);
        req.body.sunday_event=req.sanitize(req.body.sunday_event);

        var newPost = {
            city: req.body.city,
            restaurant_name: req.body.restaurant_name,
            location: req.body.location,
            thumbnail_image: req.body.thumbnail_image,
            url: req.body.url,
            sunday_drink: req.body.sunday_drink,
            sunday_food: req.body.sunday_food,
            sunday_event: req.body.sunday_event
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
//app.delete("/boats/:id", middleware.isLoggedIn, function(req,res){
//    //destroy post
//    Post.findByIdAndRemove(req.params.id, function(err){
//       if(err){
//           res.redirect("/boats/" + req.params.id);
//       } else {
//           res.redirect("/boats");
//       }
//    });
//});





// =======================================
//          Authentication Routes
// =======================================

// login form
app.get("/login", function(req, res){
    res.render("login.ejs");
});

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

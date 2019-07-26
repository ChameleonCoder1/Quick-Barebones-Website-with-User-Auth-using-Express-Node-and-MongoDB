var Post     = require("../models/post.js");
var User     = require("../models/user.js");

// all the middleware goes here
var middlewareObj={};

middlewareObj.checkUserOwnership = function(req, res, next) {
    if(req.isAuthenticated()){
        Post.findById( req.params.id , function(err, foundthepost){
            if(err){
                // Probably won't ever get used
                req.flash("error", "Data not found.");
                res.redirect("/");
            } else {
                //block added because of crashing issues
                if(!foundthepost){
                    req.flash("error", "Data was not found.");
                    return res.redirect("back");
                }
                //If the upper condition is true it will break out of the middleware

                // does user own the post?
                if(foundthepost.user.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that.");
                    res.redirect("/");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that.");
        res.redirect("/");
    }
}

//middlewareObj.checkCommentOwnership = function(req, res, next){
//    if(req.isAuthenticated()){
//        Comment.findByID(req.params.comment_id, function(err, foundComment){
//            if(err){
//                res.redirect("back");
//            } else {
//                //does user own the comment?
//                if(foundComment.user.equals(req.user._id)) {
//                    next();
//                } else {
//                    res.redirect("back");
//                }
//            }
//        });
//    } else {
//        req.flash("error", "You need to be logged in to do that.");
//        res.redirect("back");
//    }
//}




// Make the isLoggedIn middleware. Having these three parameters is standard for
// middleware...req refers to the request object, res is the response object, and
// next is the next thing that needs to be called...and we don't have to set any of
// these up, just by adding it as a middleware on a route, express will know what
// we need in order to get it to act as middleware successfully within express.
middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        next();
    } else {
        req.flash("error", "You need to be logged in to do that.");
        res.redirect("back");
    }
}





module.exports = middlewareObj;

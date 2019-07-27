var mongoose    =   require("mongoose");
var passportLocalMongoose   = require("passport-local-mongoose");

var postSchema  =   new mongoose.Schema({
    city: String,
    company_name: String,
    location: String,
    thumbnail_image: String,
    url: String
    company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company"
            }
});



module.exports  =   mongoose.model("Post", postSchema);

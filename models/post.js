var mongoose    =   require("mongoose");
var passportLocalMongoose   = require("passport-local-mongoose");

var postSchema  =   new mongoose.Schema({
    city: String,
    restaurant_name: String,
    location: String,
    thumbnail_image: String,
    url: String,
    sunday_drink: String,
    sunday_food: String,
    sunday_event: String,
    monday_drink: String,
    monday_food: String,
    monday_event: String,
    tuesday_drink: String,
    tuesday_food: String,
    tuesday_event: String,
    wednesday_drink: String,
    wednesday_food: String,
    wednesday_event: String,
    thursday_drink: String,
    thursday_food: String,
    thursday_event: String,
    friday_drink: String,
    friday_food: String,
    friday_event: String,
    saturday_drink: String,
    saturday_food: String,
    saturday_event: String,
    user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
            }
});



module.exports  =   mongoose.model("Post", postSchema);

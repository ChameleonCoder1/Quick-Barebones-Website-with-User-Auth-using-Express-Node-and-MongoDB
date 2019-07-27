var mongoose                = require("mongoose");
var passportLocalMongoose   = require("passport-local-mongoose");

var companySchema = new mongoose.Schema({
    username: String,
    password: String,
    postofcompany:
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post"
        }

});


//allows us to use the following on User object:
//  .authenticate(), .register(), .setPassword(), .serialize(), .deserialize()
companySchema.plugin(passportLocalMongoose);

//Compile the Schema that we just defined into a model (takes the Schema pattern and allows
//methods to be run on it), and save it/export it to a variable called User.
//Now we can run methods such as .find(), .create(), .remove() on
//the variable User. Note: the .model() function will pluralize the name we give it
//when it creates a database...so this database will actually be called Users.

module.exports = mongoose.model("Company", companySchema);

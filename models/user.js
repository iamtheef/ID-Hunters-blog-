var mongoose = require ("mongoose");
mongoose.connect('mongodb://localhost/blogApp_DB', {useNewUrlParser: true });
var passportLocalMongoose = require("passport-local-mongoose");



var userSchema = new mongoose.Schema ({
	username : String,
	password : String,
	email : String,
	firstName : String,
	lastName : String,
	isAdmin : {type: Boolean, default: false},
	age : Number,
	posts : [
		{
			type : mongoose.Schema.Types.ObjectId,
			ref: "Post"
		}

	]
});


userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model ("User", userSchema);

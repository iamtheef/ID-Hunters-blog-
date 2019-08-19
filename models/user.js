var mongoose = require ("mongoose");
mongoose.connect('mongodb://localhost/blogApp_DB', {useNewUrlParser: true });
var passportLocalMongoose = require("passport-local-mongoose");



var userSchema = new mongoose.Schema ({
	username : {type: String},
	password : {type: String},
	email : {type: String},
	firstName : {type: String},
	lastName : {type: String},
	isAdmin : {type: Boolean, default: false},
	posts : [
		{
			type : mongoose.Schema.Types.ObjectId,
			ref: "Post"
		}

	]
});


userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model ("User", userSchema);

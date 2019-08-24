var mongoose = require ("mongoose");
mongoose.connect('mongodb://localhost/blogApp_DB', {useNewUrlParser: true });


var postSchema = new mongoose.Schema ({
	username: String,
	authorID: String,
	artist : String,
	title : String,
	link : String,
	content : String,
	comments : [
		{
			type : mongoose.Schema.Types.ObjectId,
			ref: "Comment"
		}
	]

});

module.exports = mongoose.model ("Post", postSchema);






var mongoose = require ("mongoose");


var Comment = new mongoose.Schema ({

	userID : String,
	user : String,
	text : String
});



module.exports = mongoose.model ("Comment", Comment); 
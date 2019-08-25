var mongoose = require ("mongoose");


var Comment = new mongoose.Schema ({

	userID : String,
	user : String,
	text : String,
	createdAt : {type: Date, default: Date.now}
});



module.exports = mongoose.model ("Comment", Comment); 
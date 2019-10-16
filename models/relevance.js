var mongoose = require("mongoose");

var relevanceSchema =  mongoose.Schema({
	user: String,
	relevances: [{
		key: String,
		value: Number
	}]
});


module.exports = mongoose.model("Relevance", relevanceSchema);
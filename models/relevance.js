var mongoose = require("mongoose");

var relevanceSchema =  mongoose.Schema({
	value: Number,
	item: String,
	user: String
});


module.exports = mongoose.model("Relevance", relevanceSchema);
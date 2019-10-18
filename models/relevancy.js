var mongoose = require("mongoose");

var relevancySchema =  mongoose.Schema({
	user: String,
	label: String,
	value: Number
});


module.exports = mongoose.model("Relevancy", relevancySchema);
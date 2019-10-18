var mongoose = require("mongoose");

var effortSchema =  mongoose.Schema({
	hours: Number,
	minutes: Number,
	item: String,
	timestamp: Date,
	user: String,
	note: String
});


module.exports = mongoose.model("Effort", effortSchema);
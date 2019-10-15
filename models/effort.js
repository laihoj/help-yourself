var mongoose = require("mongoose");

var effortSchema =  mongoose.Schema({
	hours: Number,
	minutes: Number,
	item: String,
	user: String
});


module.exports = mongoose.model("Effort", effortSchema);
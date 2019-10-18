var mongoose = require("mongoose");

var itemSchema =  mongoose.Schema({
	label: String,
	category: String,
	user: String,
	priority: Number,
	effort: String
});


module.exports = mongoose.model("Item", itemSchema);
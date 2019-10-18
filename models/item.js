var mongoose = require("mongoose");

var itemSchema =  mongoose.Schema({
	label: String,
	category: String,
	user: String,
	priority: Number
});


module.exports = mongoose.model("Item", itemSchema);
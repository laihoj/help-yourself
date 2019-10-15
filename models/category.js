var mongoose = require("mongoose");

var categorySchema =  mongoose.Schema({
	label: String,
	user: String
});


module.exports = mongoose.model("Category", categorySchema);
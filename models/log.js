var mongoose = require("mongoose");

var logSchema =  mongoose.Schema({
	timestamp: Date, 
	message: String
});


module.exports = mongoose.model("Log", logSchema);
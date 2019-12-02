var mongoose = require("mongoose");

var effortSchema =  mongoose.Schema({
	user: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
	hours: Number,
	minutes: Number,
	timestamp: Date,
	note: String,
	
});


module.exports = mongoose.model("Effort", effortSchema);
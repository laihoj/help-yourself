var mongoose = require("mongoose");

var itemSchema =  mongoose.Schema({
	user: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
	label: String,
	priority: Number,

	totalMinutes: Number,
	totalRelevancy: Number,
	
});


module.exports = mongoose.model("Item", itemSchema);
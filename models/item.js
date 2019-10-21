var mongoose = require("mongoose");

var itemSchema =  mongoose.Schema({
	label: String,
	category: String,
	priority: Number,
	effort: String,
	user: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    }
});


module.exports = mongoose.model("Item", itemSchema);
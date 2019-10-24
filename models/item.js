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
    },
    parent: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Item"
        },
        label: String
    },
    children: [{
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Item"
        },
        label: String
    }]
});


module.exports = mongoose.model("Item", itemSchema);
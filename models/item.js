var mongoose = require("mongoose");
// var Float = require('mongoose-float').loadType(mongoose);

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

	cumulativeMinutes: Number
	
});


module.exports = mongoose.model("Item", itemSchema);
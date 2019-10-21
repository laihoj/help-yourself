var mongoose = require("mongoose");

var categorySchema =  mongoose.Schema({
	label: String,
	user: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    }
});


module.exports = mongoose.model("Category", categorySchema);
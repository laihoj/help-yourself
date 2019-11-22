var mongoose = require("mongoose");

var relevancySchema =  mongoose.Schema({
    user: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    value: Number,
    
});


module.exports = mongoose.model("Relevancy", relevancySchema);
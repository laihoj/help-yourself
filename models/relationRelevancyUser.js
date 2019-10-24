var mongoose = require("mongoose");

var relationRelevancyUserSchema =  mongoose.Schema({
    relevancy: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Relevancy"
        }
    },
    user: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    }
});


module.exports = mongoose.model("RelationRelevancyUser", relationRelevancyUserSchema);
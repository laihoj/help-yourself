var mongoose = require("mongoose");

var relationEffortUserSchema =  mongoose.Schema({
    effort: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Effort"
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


module.exports = mongoose.model("RelationEffortUser", relationEffortUserSchema);
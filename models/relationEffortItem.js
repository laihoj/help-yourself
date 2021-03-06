var mongoose = require("mongoose");

var relationEffortItemSchema =  mongoose.Schema({
    user: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    effort: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Effort"
        }
    },
    item: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Item"
        },
        label: String
    }
});


module.exports = mongoose.model("RelationEffortItem", relationEffortItemSchema);
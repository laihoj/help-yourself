var mongoose = require("mongoose");

var relationItemItemSchema =  mongoose.Schema({
    parent: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Item"
        },
        label: String
    },
    child: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Item"
        },
        label: String
    }
});


module.exports = mongoose.model("RelationItemItem", relationItemItemSchema);
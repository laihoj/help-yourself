var mongoose = require("mongoose");

var relationItemUserSchema =  mongoose.Schema({
    item: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Item"
        },
        label: String
    },
    user: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    }
});


module.exports = mongoose.model("RelationItemUser", relationItemUserSchema);
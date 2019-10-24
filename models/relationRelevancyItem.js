var mongoose = require("mongoose");

var relationRelevancyItemSchema =  mongoose.Schema({
    relevancy: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Relevancy"
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


module.exports = mongoose.model("RelationRelevancyItem", relationRelevancyItemSchema);
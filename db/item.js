/*******************************************************
Mongoose.js and MongoDB
********************************************************/
const mongoose = require('mongoose')

var url = process.env.DATABASEURL;
mongoose.connect(url, { useNewUrlParser: true });

const Item = require("./../models/item");
const relations = require('./relations.js');
const logs = require("./log.js");

exports.all = async function() {
	let items = await Item.find({});
	return items;
}

exports.byLabel = async function(label) {
	let item = await Item.findOne({label: label});
	return item;
}

exports.byUser = async function(user) {
	let items = await Item.find({'user.username': user.username});
	return items;
}

exports.byUserID = async function(userID) {
	let items = await Item.find({'user.id': userID});
	return items;
}

// exports.byCategory = async function(category) {
// 	let items = await Item.find({category: category});
// 	return items;
// }

exports.byID = async function(id) {
	let item = Item.findOne({_id: id});
	return item;
}

exports.save = async function(label, user) {
	var item = new Item({
		label: label,
		user: {
			id: user._id || user.id,   //lazy fix, not sure which one is right. 80% sure user.id is right
			username: user.username
		},
		priority: 0,
		totalMinutes: 0,
		totalRelevancy: 0
	});

	item.save();
	let logMessage = "Saved item: " + item;
	await logs.save(logMessage);
	
 	return item;
}

// exports.save = async function(label, category, user) {
// 	var item = new Item({
// 		label: label,
// 		user: {
// 			id: user._id,
// 			username: user.username
// 		},
// 		priority: 0,
// 		totalMinutes: 0,
// 		totalRelevancy: 0
// 	});

// 	item.save();
// 	let logMessage = "Saved item: " + item;
// 	await logs.save(logMessage);
	
//  	return item;
// }

exports.delete = async function(id) {
	let res = await exports.byID(id);	
	res.delete();
	let logMessage = "Deleted item: " + res;
	await logs.save(logMessage);
	return res;
}

exports.update = async function(itemObj, label, totalMinutes, priority, totalRelevancy) {
	itemObj.label = label;
	// if (typeof priority == 'number') {
		itemObj.priority = priority;
	// } else {console.log("Failed to update " + itemObj + " priority");}
	// if (typeof totalMinutes == 'number') {
		itemObj.totalMinutes = totalMinutes;
	// } else {console.log("Failed to update " + itemObj + " totalMinutes");}
	// if (typeof totalRelevancy == 'number') {
		itemObj.totalRelevancy = totalRelevancy;
	// } else {console.log("Failed to update " + itemObj + " totalRelevancy");}
	itemObj.save();
	let logMessage = "Updated item: " + itemObj;
	await logs.save(logMessage);
	return itemObj;
}

exports.byIDAndUpdate = async function(id, label, priority, totalMinutes, totalRelevancy) {
	let itemToUpdate = await exports.byID(id);
	exports.update(itemToUpdate, label, totalMinutes, priority, totalRelevancy);
	return itemToUpdate;
}

// exports.byIDAndUpdate = async function(id, user, label, category, priority, totalMinutes, totalRelevancy) {
// 	let itemToUpdate = await exports.byID(id);
// 	exports.update(itemToUpdate, label, totalMinutes, priority, totalRelevancy);
// 	return itemToUpdate;
// }


//doesnt actually do anything
exports.byLabelAndUpdate = async function(label) {
	console.log("DECOMMISION ME FROM SOURCE CODE");
	let itemToUpdate = await exports.byLabel(label);
	itemToUpdate.save();
	let logMessage = "Updated item: " + itemToUpdate;
	await logs.save(logMessage);
	return itemToUpdate;
}

// exports.byLabelAndUpdate = async function(label, category) {
// 	let itemToUpdate = await exports.byLabel(label);
// 	itemToUpdate.category = category;
// 	itemToUpdate.save();
// 	let logMessage = "Updated item: " + itemToUpdate;
// 	await logs.save(logMessage);
// 	return itemToUpdate;
// }

/*///update complete, routes decommissioned
exports.updateUserModel = async function(user, id) {
	let itemToUpdate = await exports.byID(id);
	itemToUpdate.user = {
		id: user._id,
		username: user.username
	};
	return itemToUpdate.save();
}
*/
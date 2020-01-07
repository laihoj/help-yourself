/*******************************************************
Mongoose.js and MongoDB
********************************************************/
const mongoose = require('mongoose')

var url = process.env.DATABASEURL;
mongoose.connect(url, { useNewUrlParser: true , useUnifiedTopology: true});

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


exports.update2 = async function(itemObj, data) {
	itemObj.label 				= data.label || itemObj.label || "NO LABEL";
	if(typeof data.priority === 'number')
		itemObj.priority 			= data.priority;
	else if(typeof itemObj.priority === 'undefined')
		itemObj.priority = 0;

	if(typeof data.totalMinutes === 'number')
		itemObj.totalMinutes 			= data.totalMinutes;
	else if(typeof itemObj.totalMinutes === 'undefined')
		itemObj.totalMinutes = 0;

	if(typeof data.totalRelevancy === 'number')
		itemObj.totalRelevancy 		= data.totalRelevancy;
	else if(typeof itemObj.totalRelevancy === 'undefined')
		itemObj.totalRelevancy = 0;

	if(typeof data.cumulativeMinutes === 'number')
		itemObj.cumulativeMinutes 	= data.cumulativeMinutes;
	else if(typeof itemObj.cumulativeMinutes === 'undefined')
		itemObj.cumulativeMinutes = 0;


	

	// 	itemObj.priority 			= data.priority || itemObj.priority || 0;
	// 	itemObj.totalMinutes 		= data.totalMinutes || itemObj.totalMinutes || 0;
	// itemObj.totalRelevancy 		= data.totalRelevancy || itemObj.totalRelevancy || 0;
	// itemObj.cumulativeMinutes 	= data.cumulativeMinutes || itemObj.cumulativeMinutes || 0;
	itemObj.save();
	let logMessage = "Updated item: " + itemObj;
	await logs.save(logMessage);
	return itemObj;
}

// exports.update2 = async function(itemObj, data) {
// 	itemObj.label 				= data.label || itemObj.label || "NO LABEL";
// 	if(data.priority == 0)
// 		itemObj.priority = 0;
// 	else
// 		itemObj.priority 			= data.priority || itemObj.priority || 0;
// 	if(data.totalMinutes == 0)
// 		itemObj.totalMinutes = 0;
// 	else
// 		itemObj.totalMinutes 		= data.totalMinutes || itemObj.totalMinutes || 0;
// 	if(data.totalRelevancy == 0)
// 		itemObj.totalRelevancy = 0;
// 	else
// 	itemObj.totalRelevancy 		= data.totalRelevancy || itemObj.totalRelevancy || 0;
// 	if(data.cumulativeMinutes == 0)
// 		itemObj.cumulativeMinutes = 0;
// 	else
// 	itemObj.cumulativeMinutes 	= data.cumulativeMinutes || itemObj.cumulativeMinutes || 0;
// 	itemObj.save();
// 	let logMessage = "Updated item: " + itemObj;
// 	await logs.save(logMessage);
// 	return itemObj;
// }


//deprecated
exports.update = async function(itemObj, label, totalMinutes, priority, totalRelevancy, cumulativeMinutes) {
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
		itemObj.cumulativeMinutes = cumulativeMinutes;
	itemObj.save();
	let logMessage = "Updated item: " + itemObj;
	await logs.save(logMessage);
	return itemObj;
}

exports.byIDAndUpdate = async function(id, label, priority, totalMinutes, totalRelevancy, cumulativeMinutes) {
	let itemToUpdate = await exports.byID(id);
	exports.update(itemToUpdate, label, totalMinutes, priority, totalRelevancy, cumulativeMinutes);
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
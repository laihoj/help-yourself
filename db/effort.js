/********************************************************
Mongoose.js and MongoDB
********************************************************/
const mongoose = require('mongoose')

var url = process.env.DATABASEURL;
mongoose.connect(url, { useNewUrlParser: true , useUnifiedTopology: true});

const Effort = require("./../models/effort");
const relations = require('./relations.js');
const Item = require("./../models/item");
const items = require('./item.js');
const logs = require("./log.js");

exports.all = async function() {
	let efforts = await Effort.find({});
	return efforts;
}

exports.byUser = async function(user) {
	let efforts = await Effort.find({'user.username': user.username});
	return efforts;
}

exports.byUserID = async function(userID) {
	let efforts = await Effort.find({'user.id': userID});
	return efforts;
}

exports.byItem = async function(item) {
	let efforts = await Effort.find({item: item});
	return efforts;
}

exports.byID = async function(id) {
	let res = await Effort.findOne({_id: id});
	return res;
}

exports.byDate = async function(userID, year, month, day) {
	let efforts;
	try {
		let date = new Date(year+"-"+month+"-"+day);
		let yesterday = new Date();
		let tomorrow = new Date();
		yesterday.setDate(date.getDate() - 1);
		tomorrow.setDate(date.getDate() + 1);
		efforts = await Effort.find({'user.id': userID, timestamp: {$gt: yesterday, $lte: date}});
	} catch(err) {
		console.log(err);
	}
	return efforts;
	
}

exports.save = async function(hours, minutes, itemId, timestamp, user, note) {
	var effort = new Effort({
		hours: hours || 0,
		minutes: minutes || 0,
		timestamp: timestamp,
		user: {
			id: user._id || user.id,  //lazy fix, not sure which one is right. 80% sure user.id is right
			username: user.username
		},
		note: note
	});

	// let item = await items.byID(itemId);
	// if(item) {
	// 	relations.effortItem.save(effort, item);
	// }

 	return effort.save();
 	let logMessage = "Saved effort: " + effort;
	await logs.save(logMessage);
	return effort;
}

exports.update = async function(effortObj, hours, minutes, timestamp, note) {
		effortObj.hours = hours || 0;
		effortObj.minutes = minutes || 0;
		effortObj.timestamp = timestamp;
		effortObj.note = note;
	effortObj.save();
	let logMessage = "Updated effort: " + effortObj;
	await logs.save(logMessage);
	return effortObj;
}

exports.byIdAndUpdate = async function(id, hours, minutes, timestamp, note) {
	let effortToUpdate = await exports.byID(id);
	await exports.update(effortToUpdate, hours, minutes, timestamp, note );
	return effortToUpdate;
}


exports.delete = async function(id) {
	let res = await exports.byID(id);	
	res.delete();
	let logMessage = "Deleted effort: " + res;
	await logs.save(logMessage);
	return res;
}

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
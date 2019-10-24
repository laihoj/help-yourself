/********************************************************
Mongoose.js and MongoDB
********************************************************/
const mongoose = require('mongoose')

var url = process.env.DATABASEURL;
mongoose.connect(url, { useNewUrlParser: true });

const Effort = require("./../models/effort");
const relations = require('./relations.js');
const Item = require("./../models/item");

exports.all = async function() {
	return Effort.find({}).exec();
}

exports.byUser = async function(user) {
	return Effort.find({'user.username': user.username}).exec();
}

exports.byUserID = async function(userID) {
	return Effort.find({'user.id': userID}).exec();
}

exports.byItem = async function(item) {
	return Effort.find({item: item}).exec();
}

// exports.byItemObject = async function(itemObj) {
// 	return Effort.find({item: item}).exec();
// }

exports.byID = async function(id) {
	// console.log("searching by: " + id);
	
	let res = await Effort.findOne({_id: id});
	// console.log("found after search: " + res);
	return res;
}


  // var date = new Date("<%= date.month + "-"+date.day+"-"+date.year%>");
  // var yesterday = new Date();
  // yesterday.setDate(date.getDate() - 1);
  // var tomorrow = new Date();
  // tomorrow.setDate(date.getDate() + 1);

  // document.getElementById("goToYesterday").action = "/calendar/"+yesterday.getFullYear()+"/"+(parseInt(yesterday.getMonth())+1)+"/"+yesterday.getDate()+"/";

  // document.getElementById("goToTomorrow").action = "/calendar/"+tomorrow.getFullYear()+"/"+(parseInt(tomorrow.getMonth())+1)+"/"+tomorrow.getDate()+"/";


exports.byDate = async function(userID, year, month, day) {
	// let date = new Date(month+"-"+day+"-"+year);
	let date = new Date(year+"-"+month+"-"+day);
	let yesterday = new Date();
	let tomorrow = new Date();
	yesterday.setDate(date.getDate() - 1);
	tomorrow.setDate(date.getDate() + 1);
	return Effort.find({'user.id': userID, timestamp: {$gt: yesterday, $lte: date}}).exec();
}

exports.save = async function(hours, minutes, itemLabel, timestamp, user, note) {
	var effort = new Effort({
		hours: hours,
		minutes: minutes,
		item: itemLabel,
		timestamp: timestamp,
		user: {
			id: user._id,
			username: user.username
		},
		note: note
	});

	let item = await Item.findOne({"user.id": user._id, label: itemLabel});
	if(item) {
		relations.effortItem.save(effort, item);
	}
	relations.effortUser.save(effort, user);

 	return effort.save();
}

exports.byIdAndUpdate = async function(id, user, item, hours, minutes, timestamp, note) {
	let effortToUpdate = await exports.byID(id);
	// effortToUpdate.user = user;
	effortToUpdate.item = item;
	effortToUpdate.hours = hours;
	effortToUpdate.minutes = minutes;
	effortToUpdate.timestamp = timestamp;
	effortToUpdate.note = note;
	return effortToUpdate.save();
}


exports.delete = async function(id) {
	let res = await exports.byID(id);	
	return res.delete();
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
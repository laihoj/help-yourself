/********************************************************
Mongoose.js and MongoDB
********************************************************/
const mongoose = require('mongoose')

var url = process.env.DATABASEURL;
mongoose.connect(url, { useNewUrlParser: true });

const Effort = require("./../models/effort");

exports.all = async function() {
	return Effort.find({}).exec();
}

exports.byUser = async function(user) {
	return Effort.find({user: user}).exec();
}

exports.byItem = async function(item) {
	return Effort.find({item: item}).exec();
}

exports.byID = async function(id) {
	return Effort.findOne({_id: id}).exec();
}

exports.save = async function(hours, minutes, item, timestamp, user) {
	var effort = new Effort({
		hours: hours,
		minutes: minutes,
		item: item,
		timestamp: timestamp,
		user: user
	});
 	return effort.save();
}

exports.byIdAndUpdate = async function(id, user, item, hours, minutes, timestamp) {
	let effortToUpdate = await exports.byID(id);
	effortToUpdate.user = user;
	effortToUpdate.item = item;
	effortToUpdate.hours = hours;
	effortToUpdate.minutes = minutes;
	effortToUpdate.timestamp = timestamp;
	return effortToUpdate.save();
}


exports.delete = async function(id) {
	let res = await exports.byID(id);	
	return res.delete();
}
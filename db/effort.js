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

exports.delete = async function(id) {
	let res = await exports.byID(id);	
	return res.delete();
}
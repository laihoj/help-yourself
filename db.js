/********************************************************
Mongoose.js and MongoDB
********************************************************/
const mongoose = require('mongoose')

var url = process.env.DATABASEURL || "mongodb://user:monday1@ds235078.mlab.com:35078/helpme";
mongoose.connect(url, { useNewUrlParser: true });

const User = require("./models/user");
// const Device = require("./models/device");
// const Datapoint = require("./models/datapoint");
// const Gesture = require("./models/gesture");
const Category = require("./models/category");
const Item = require("./models/item");
const Effort = require("./models/effort");
const Relevance = require("./models/relevance");


// exports.datapoints = async function(latest_N) {
// 	if(arguments.length == 0) {
// 		return Datapoint.find({}).exec();
// 	}
// 	//not used anywhere?
// 	if(arguments.length == 1) {
// 		return Datapoint.find({})
// 						.skip(db.collection.count() - N)
// 						.exec();
// 	}
// }


// exports.datapointsInTimeSpan = async function(start, end) {
// 	return Datapoint.find({
// 		timestamp:{$gt: start, $lt: end}}).exec();
// }

// exports.saveDatapoint = async function(device_address, timestamp, data) {
// 	var datapoint = new Datapoint({
// 		device_address: device_address,
// 		timestamp: timestamp,
// 		data: data
// 	});
//  	return datapoint.save();
// }

// exports.devices = async function() {
// 	return Device.find({}).exec();
// }

// exports.gestures = async function() {
// 	return Gesture.find({}).exec();
// }


exports.categories = async function() {
	return Category.find({}).exec();
}

exports.items = async function() {
	return Item.find({}).exec();
}

exports.efforts = async function() {
	return Effort.find({}).exec();
}

exports.relevances = async function() {
	return Relevance.find({}).exec();
}


// exports.getGesturesByLabel = async function(label) {
// 	return Gesture.find({label: label}).exec();
// }

// exports.getDeviceByAddress = async function(address) {
// 	return Device.findOne({address: address}).exec();
// }

// exports.getDevicesByUser = async function(user) {
// 	return Device.find({user: user}).exec();
// }

exports.getCategoriesByUser = async function(user) {
	return Category.find({user: user}).exec();
}

exports.getItemsByUser = async function(user) {
	return Item.find({user: user}).exec();
}

exports.getEffortsByUser = async function(user) {
	return Effort.find({user: user}).exec();
}

exports.getRelevancesByUser = async function(user) {
	return Relevance.find({user: user}).exec();
}


// exports.saveDevice = async function(device_label, device_address, device_uuid, device_name, device_user) {
// 	var device = new Device({
// 		label: device_label,
// 		address: device_address,
// 		uuid: device_uuid,
// 		name: device_name,
// 		user: device_user
// 	});
//  	return device.save();
// }

// exports.saveGesture = async function(start_timestamp, end_timestamp, label, user) {
// 	var gesture = new Gesture({
// 		start_timestamp: start_timestamp,
// 		end_timestamp: end_timestamp,
// 		label: label,
// 		user: user
// 	});
//  	return gesture.save();
// }




exports.saveCategory = async function(label, user) {
	var category = new Category({
		label: label,
		user: user
	});
 	return category.save();
}

exports.saveItem = async function(label, category, user) {
	var item = new Item({
		label: label,
		category: category,
		user: user
	});
 	return item.save();
}

exports.saveEffort = async function(hours, minutes, item, user) {
	var effort = new Effort({
		hours: hours,
		minutes: minutes,
		item: item,
		user: user
	});
 	return effort.save();
}

exports.saveRelevance = async function(value, item, user) {
	var relevance = new Relevance({
		value: value,
		item: item,
		user: user
	});
 	return relevance.save();
}


exports.getUser = async function(user) {
	return User.find({username: user}).exec();
}

exports.saveUser = async function(username, password) {
	const newUser = new User({username:username});
	await newUser.setPassword(password);
	return newUser.save();
}

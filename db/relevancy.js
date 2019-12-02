/*******************************************************
Mongoose.js and MongoDB
********************************************************/
const mongoose = require('mongoose')

var url = process.env.DATABASEURL;
mongoose.connect(url, { useNewUrlParser: true , useUnifiedTopology: true});

const Relevancy = require("./../models/relevancy");
const relations = require('./relations.js');
const Item = require("./../models/item");
const logs = require("./log.js");

exports.all = async function() {
	let res = await Relevancy.find({}).exec();
	return res;
}

exports.byID = async function(id) {
	let res = await Relevancy.findOne({_id: id}).exec();
	return res;
}

exports.byLabel = async function(label) {
	let res = await Relevancy.findOne({label: label}).exec();
	return res;
}

exports.byUser = async function(user) {
	let res = await Relevancy.find({'user.username': user.username}).exec();
	return res;
}

exports.byUserID = async function(userID) {
	let res = await Relevancy.find({'user.id': userID}).exec();
	return res;
}

exports.byIdAndUpdate = async function(id, value) {
	let relevancyToUpdate = await exports.byID(id);
	relevancyToUpdate = await exports.update(relevancyToUpdate, value);
	return relevancyToUpdate;
}


//NOT SUPPORTED
// exports.byLabelAndUpdate = async function(user, label, value) {
// 	let relevancyToUpdate = await exports.byLabel(label);
// 	if(relevancyToUpdate) 
// 	{
// 		relevancyToUpdate.label = label;
// 		relevancyToUpdate.value = value;
// 		return relevancyToUpdate.save();
// 	} else {
// 		exports.save({id:user._id, username: user.username}, label, value);
// 	}
// }

exports.update = async function(relevancyObj, value) {
	relevancyObj.value = value;
	relevancyObj.save();
	let logMessage = "Updated relevancy: " + relevancyObj;
	await logs.save(logMessage);
	return relevancyObj;
}

exports.save = async function(user, value) {
	var relevancy = new Relevancy({
		user: {
			id: user._id,
			username: user.username
		},
		value: value
	});
 	relevancy.save();
 	let logMessage = "Saved relevancy: " + relevancy;
	await logs.save(logMessage);
 	return relevancy;
}


exports.delete = async function(id) {
	let res = await exports.byID(id);	
	res.delete();
	let logMessage = "Deleted relevancy: " + res;
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

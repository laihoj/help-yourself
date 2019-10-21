/********************************************************
Mongoose.js and MongoDB
********************************************************/
const mongoose = require('mongoose')

var url = process.env.DATABASEURL;
mongoose.connect(url, { useNewUrlParser: true });

const Relevancy = require("./../models/relevancy");

exports.all = async function() {
	return Relevancy.find({}).exec();
}

exports.byID = async function(id) {
	return Relevancy.findOne({_id: id}).exec();
}

exports.byLabel = async function(label) {
	return Relevancy.findOne({label: label}).exec();
}

exports.byUser = async function(user) {
	return Relevancy.find({'user.username': user.username}).exec();
}

exports.byIdAndUpdate = async function(id, user, label, value) {
	let relevancyToUpdate = await exports.byID(id);
	// relevancyToUpdate.user = user;
	relevancyToUpdate.label = label;
	relevancyToUpdate.value = value;
	return relevancyToUpdate.save();
}


exports.byLabelAndUpdate = async function(user, label, value) {
	let relevancyToUpdate = await exports.byLabel(label);
	// console.log("Searched relevancy by " + label + " and got " + relevancyToUpdate);
	if(relevancyToUpdate) 
	{
		// relevancyToUpdate.user = user;
		relevancyToUpdate.label = label;
		relevancyToUpdate.value = value;
		return relevancyToUpdate.save();
	} else {
		exports.save({id:user._id, username: user.username}, label, value);
	}
}


exports.save = async function(user, label, value) {
	var relevancy = new Relevancy({
		user: {
			id: user._id,
			username: user.username
		},
		label: label,
		value: value
	});
 	return relevancy.save();
}


exports.delete = async function(id) {
	let res = await exports.byID(id);	
	return res.delete();
}


exports.updateUserModel = async function(user, id) {
	let itemToUpdate = await exports.byID(id);
	itemToUpdate.user = {
		id: user._id,
		username: user.username
	};
	return itemToUpdate.save();
}
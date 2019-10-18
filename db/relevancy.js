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
	return Relevancy.find({user: user}).exec();
}

// exports.add = async function(user, key, value) {
// 	let res = await exports.byUser(user);
// 	// console.log(res);
// 	res.relevancies.push({"key":key, "value":value});
// 	return res.save();
// }

// exports.byUserAndUpdate = async function(user, relevancies) {
// 	let res = await exports.byUser(user);
// 	let relevanciesToUpdate = res.relevancies;
// 	for(var i = 0; i < relevanciesToUpdate.length; i++) {
// 		var key 		= relevanciesToUpdate[i].key;
// 		var value	 	= relevanciesToUpdate[i].value;
// 		var formkey		= relevanciesToUpdate[i].key+"_relevancy";
// 		var newvalue 	= relevancies[formkey];
// 		if(!isNaN(newvalue)) {
// 			relevanciesToUpdate[i].value = newvalue;
// 		}
// 	}
// 	return res.save();
// }

exports.byIdAndUpdate = async function(id, user, label, value) {
	let relevancyToUpdate = await exports.byID(id);
	relevancyToUpdate.user = user;
	relevancyToUpdate.label = label;
	relevancyToUpdate.value = value;
	return relevancyToUpdate.save();
}


exports.byLabelAndUpdate = async function(user, label, value) {
	let relevancyToUpdate = await exports.byLabel(label);
	// console.log("Searched relevancy by " + label + " and got " + relevancyToUpdate);
	if(relevancyToUpdate) 
	{
		relevancyToUpdate.user = user;
		relevancyToUpdate.label = label;
		relevancyToUpdate.value = value;
		return relevancyToUpdate.save();
	} else {
		exports.save(user, label, value);
	}
	
}


exports.save = async function(user, label, value) {
	var relevancy = new Relevancy({
		user: user,
		label: label,
		value: value
	});
 	return relevancy.save();
}


exports.delete = async function(id) {
	let res = await exports.byID(id);	
	return res.delete();
}
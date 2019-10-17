/********************************************************
Mongoose.js and MongoDB
********************************************************/
const mongoose = require('mongoose')

var url = process.env.DATABASEURL;
mongoose.connect(url, { useNewUrlParser: true });

const Relevance = require("./../models/relevance");

exports.all = async function() {
	return Relevance.find({}).exec();
}

exports.byID = async function(id) {
	return Relevance.findOne({_id: id}).exec();
}

exports.byUser = async function(user) {
	return Relevance.findOne({user: user}).exec();
}

// exports.byItem = async function(item) {
// 	let relevance = await Relevance.findOne({user: item.user});
// 	for(let i = 0; i < relevance.relevances.length; i++) {
// 		let key = relevance.relevances[i].key;
// 		if(key === item.label) {
// 			return relevance.relevances[i];
// 		}
// 	}
// 	return null;
// 	// return Relevance.findOne({user: user}).exec();
// }

// exports.byCategory = async function(category) {
// 	console.log("searching by: " + category);
// 	let relevance = await Relevance.findOne({user: category.user});
// 	console.log("found: " + relevance);
// 	for(let i = 0; i < relevance.relevances.length; i++) {
// 		let key = relevance.relevances[i].key;
// 		if(key === category.category) {
// 			return relevance.relevances[i];
// 		}
// 	}
// 	return null;
// 	// return Relevance.findOne({user: user}).exec();
// }

exports.add = async function(user, key, value) {
	let res = await exports.byUser(user);
	// console.log(res);
	res.relevances.push({"key":key, "value":value});
	return res.save();
}

exports.byUserAndUpdate = async function(user, relevances) {
	let res = await exports.byUser(user);
	let relevancesToUpdate = res.relevances;
	// console.log("relevances retreived: " + relevancesToUpdate);
	for(var i = 0; i < relevancesToUpdate.length; i++) {
		var key 		= relevancesToUpdate[i].key;
		var value	 	= relevancesToUpdate[i].value;
		// var newvalue 	= relevances["sovellusohjelmointi_relevance"];
		var formkey		= relevancesToUpdate[i].key+"_relevance";
		// console.log("Looking for form input by the name: " + formkey);
		
		var newvalue 	= relevances[formkey];
		

		// console.log("Key: " + key + ", value: " + value + ", newvalue: " + newvalue);
		if(!isNaN(newvalue)) {
			relevancesToUpdate[i].value = newvalue;
		}
	}
	// console.log("relevances updated: " + res);
	// relevancesToUpdate.relevances = relevances;
	return res.save();

}

exports.save = async function(user) {
	var relevance = new Relevance({
		user: user,
		relevances:{}
	});
 	return relevance.save();
}


exports.delete = async function(id) {
	let res = await exports.byID(id);	
	return res.delete();
}
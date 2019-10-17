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


//try not to use
exports.byUser = async function(user) {
	return Relevance.find({user: user}).exec();
}

exports.byUser = async function(user) {
	let relevances = await Relevance.find({user: user}).exec();
	if(relevances.length > 0) {
		return relevances[0];
	}
	else return {"label": "Item label does not produce a hit"};
}



exports.add = async function(user, key, value) {
	let res = await exports.getRelevanceByUser(user);
	console.log(res);
	res.relevances.push({"key":key, "value":value});
	return res.save();
}

exports.byUserAndUpdate = async function(user, relevances) {
	let res = await exports.getRelevanceByUser(user);
	let relevancesToUpdate = res.relevances;
	console.log("relevances retreived: " + relevancesToUpdate);
	for(var i = 0; i < relevancesToUpdate.length; i++) {
		var key 		= relevancesToUpdate[i].key;
		var value	 	= relevancesToUpdate[i].value;
		// var newvalue 	= relevances["sovellusohjelmointi_relevance"];
		var formkey		= relevancesToUpdate[i].key+"_relevance";
		console.log("Looking for form input by the name: " + formkey);
		var newvalue 	= relevances[formkey];

		console.log("Key: " + key + ", value: " + value + ", newvalue: " + newvalue);
		relevancesToUpdate[i].value = newvalue;
	}
	console.log("relevances updated: " + res);
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
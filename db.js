/********************************************************
Mongoose.js and MongoDB
********************************************************/
const mongoose = require('mongoose')

var url = process.env.DATABASEURL;
mongoose.connect(url, { useNewUrlParser: true });

const User = require("./models/user");
const Category = require("./models/category");
const Item = require("./models/item");
const Effort = require("./models/effort");
const Relevance = require("./models/relevance");

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


exports.getCategoriesByUser = async function(user) {
	return Category.find({user: user}).exec();
}

exports.getItemByLabel = async function(label) {
	let items = await Item.find({label: label}).exec();
	if(items.length > 0)
	{	
		return items[0];
	} else return {"label": "Item label does not produce a hit"};
}

exports.getItemsByUser = async function(user) {
	return Item.find({user: user}).exec();
}

exports.getItemsByCategory = async function(category) {
	return Item.find({category: category}).exec();
}

exports.getEffortsByUser = async function(user) {
	return Effort.find({user: user}).exec();
}

//try not to use
exports.getRelevancesByUser = async function(user) {
	return Relevance.find({user: user}).exec();
}

exports.getRelevanceByUser = async function(user) {
	let relevances = await Relevance.find({user: user}).exec();
	if(relevances.length > 0) {
		return relevances[0];
	}
	else return {"label": "Item label does not produce a hit"};
}




exports.saveCategory = async function(label, user) {
	var category = new Category({
		label: label,
		user: user
	});
	exports.addRelevance(user, label, 50);
 	return category.save();
}

exports.saveItem = async function(label, category, user) {
	var item = new Item({
		label: label,
		category: category,
		user: user
	});
	exports.addRelevance(user, label, 50);
 	return item.save();
}



exports.findItemByLabelAndUpdate = async function(label, category) {
	let itemToUpdate = await exports.getItemByLabel(label);
	itemToUpdate.category = category;
	return itemToUpdate.save();

}

exports.addRelevance = async function(user, key, value) {
	let res = await exports.getRelevanceByUser(user);
	console.log(res);
	res.relevances.push({"key":key, "value":value});
	return res.save();
}

exports.findRelevancesByUserAndUpdate = async function(user, relevances) {
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



exports.saveEffort = async function(hours, minutes, item, timestamp, user) {
	var effort = new Effort({
		hours: hours,
		minutes: minutes,
		item: item,
		timestamp: timestamp,
		user: user
	});
 	return effort.save();
}

exports.saveRelevance = async function(user) {
	var relevance = new Relevance({
		user: user,
		relevances:{}
	});
 	return relevance.save();
}


exports.getUser = async function(user) {
	return User.find({username: user}).exec();
}

exports.saveUser = async function(username, password) {
	const newUser = new User({username:username});
	await newUser.setPassword(password);

	const newRelevances = await exports.saveRelevance(username);
	return newUser.save();
}

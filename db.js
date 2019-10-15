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

exports.getRelevancesByUser = async function(user) {
	return Relevance.find({user: user}).exec();
}




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



exports.findItemByLabelAndUpdate = async function(label, category) {
	let itemToUpdate = await exports.getItemByLabel(label);
	itemToUpdate.category = category;
	return itemToUpdate.save();

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

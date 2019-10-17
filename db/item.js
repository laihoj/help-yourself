/********************************************************
Mongoose.js and MongoDB
********************************************************/
const mongoose = require('mongoose')

var url = process.env.DATABASEURL;
mongoose.connect(url, { useNewUrlParser: true });

const Item = require("./../models/item");

exports.all = async function() {
	return Item.find({}).exec();
}

exports.byLabel = async function(label) {
	let items = await Item.find({label: label}).exec();
	if(items.length > 0)
	{	
		return items[0];
	} else return {"label": "Item label does not produce a hit"};
}

exports.byUser = async function(user) {
	return Item.find({user: user}).exec();
}

exports.cyCategory = async function(category) {
	return Item.find({category: category}).exec();
}

exports.byID = async function(id) {
	return Item.findOne({_id: id}).exec();
}

exports.save = async function(label, category, user) {
	var item = new Item({
		label: label,
		category: category,
		user: user
	});
	exports.addRelevance(user, label, 50);
 	return item.save();
}

//TODO: delete item from relevances also
exports.delete = async function(id) {
	let res = await exports.byID(id);	
	return res.delete();
}

exports.byLabelAndUpdate = async function(label, category) {
	let itemToUpdate = await exports.getItemByLabel(label);
	itemToUpdate.category = category;
	return itemToUpdate.save();
}


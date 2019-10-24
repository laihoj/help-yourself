/********************************************************
Mongoose.js and MongoDB
********************************************************/
const mongoose = require('mongoose')

var url = process.env.DATABASEURL;
mongoose.connect(url, { useNewUrlParser: true });

const Item = require("./../models/item");
const relations = require('./relations.js');

exports.all = async function() {
	return Item.find({}).exec();
}

exports.byLabel = async function(label) {
	let item = await Item.findOne({label: label}).exec();
	return item;
	
	// let items = await Item.find({label: label}).exec();
	// if(items.length > 0)
	// {	
	// 	return items[0];
	// } else return {"label": "Item label does not produce a hit"};
}

exports.byUser = async function(user) {
	return Item.find({'user.username': user.username}).exec();
}

exports.byUserID = async function(userID) {
	return Item.find({'user.id': userID}).exec();
}

exports.byCategory = async function(category) {
	return Item.find({category: category}).exec();
}

exports.byID = async function(id) {
	return Item.findOne({_id: id}).exec();
}

exports.save = async function(label, category, user, parentLabel) {
	let parent = await Item.findOne({"user.id": user._id, label: parentLabel});
	var item = new Item({
		label: label,
		category: category,
		// user: user,
		user: {
			id: user._id,
			username: user.username
		}
	});
	item.save();

	relations.itemUser.save(item, user);
	// relations.itemUser.save(item, user);

	if(parent) {
		item.parent = {
			id: parent._id,
			label: parent.label
		}
		var child = {
			_id: item._id, 
			label: item.label
		};
		parent.children.push(child);
		parent.save();
		relations.itemItem.save(parent, child);
	}
	

	// exports.addRelevance(user, label, 50);
 	return item;
}

//TODO: delete item from relevances also
exports.delete = async function(id) {
	let res = await exports.byID(id);	
	return res.delete();
}


exports.byIDAndUpdate = async function(id, user, label, category, priority, effort) {
	let itemToUpdate = await exports.byID(id);
	// itemToUpdate.user = user;
	itemToUpdate.label = label;
	itemToUpdate.category = category;
	itemToUpdate.priority = priority;
	itemToUpdate.effort = effort;
	return itemToUpdate.save();
}

exports.byLabelAndUpdate = async function(label, category) {
	let itemToUpdate = await exports.byLabel(label);
	itemToUpdate.category = category;
	return itemToUpdate.save();
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
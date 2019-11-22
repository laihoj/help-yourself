/********************************************************
Mongoose.js and MongoDB
********************************************************/
const mongoose = require('mongoose')

var url = process.env.DATABASEURL;
mongoose.connect(url, { useNewUrlParser: true });

const ItemItem = require("./../models/relationItemItem");
const logs = require("./log.js");

/********************************************************
Get all
********************************************************/

exports.all = async function() {
	let res = await ItemItem.find({});
	return res;
}

/********************************************************
Get one
********************************************************/

exports.findOne = async function(parentObj, childObj) {
	let res = await ItemItem.findOne({
		'parent.id': parentObj._id, 
		'child.id': childObj._id
	}).exec();
	return res;
}

/********************************************************
Get by filter
********************************************************/

exports.byID = async function(id) {
	let res = await ItemItem.findOne({
		_id: id
	});
	return res;
}
//good for finding children
exports.byParent = async function(parentObj) {
	let res = await ItemItem.find({
		'parent.id': parentObj._id
	});
	return res;
}
//good for finding a parent
exports.byChild = async function(childObj) {
	let res = await ItemItem.findOne({
		'child.id': childObj._id
	});
	return res;
}
exports.byUser = async function(userObj) {
	let res = await ItemItem.find({
		'user.id': userObj._id
	});
	return res;
}

/********************************************************
Create
********************************************************/

exports.save = async function(parentObj, childObj, userObj) {
	let relation = new ItemItem({
		user: {
			id: userObj._id,
			username: userObj.username
		},
		parent: {
			id: parentObj._id,
			label: parentObj.label
		},
		child: {
			id: childObj._id,
			label: childObj.label
		}
	});
	relation.save();
	let logMessage = "Saved relation: " + relation;
	await logs.save(logMessage);
	return relation;
}

/********************************************************
Update
********************************************************/

exports.update = async function(relationObj, parentObj, childObj) {
	// let relation = await exports.ItemItem.byId(id);
	relationObj.parent.id = parentObj._id || parentObj.id;
	relationObj.parent.label = parentObj.label;
	relationObj.child.id = childObj._id || childObj.id;
	relationObj.child.label = childObj.label;
	relationObj.save();
	let logMessage = "Updated relation: " + relationObj;
	await logs.save(logMessage);
	return relationObj;
}

exports.updateByID = async function(id, parentObj, childObj) {
	let relationObj = await exports.ItemItem.byId(id);
	relationObj = await exports.update(relationObj, parentObj, childObj);
	return relationObj;
}

/********************************************************
Destroy
********************************************************/

exports.deleteByID = async function(id) {
	let relation = await exports.ItemItem.byID(id);	
	exports.delete(relation);
	return relation;
}

exports.delete = async function(relationObj) {
	relationObj.delete();
	let logMessage = "Deleted relation: " + relationObj;
	await logs.save(logMessage);
	return relationObj;
}
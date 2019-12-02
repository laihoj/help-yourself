/********************************************************
Mongoose.js and MongoDB
********************************************************/
const mongoose = require('mongoose')

var url = process.env.DATABASEURL;
mongoose.connect(url, { useNewUrlParser: true , useUnifiedTopology: true});

const EffortItem = require("./../models/relationEffortItem");
const logs = require("./log.js");

/********************************************************
Get all
********************************************************/

exports.all = async function() {
	let effortitems = await EffortItem.find({});
	return effortitems;
}

/********************************************************
Get one
********************************************************/

exports.findOne = async function(effortObj, itemObj) {
	let effortitem = await EffortItem.findOne({
		'effort.id':effortObj._id, 
		'item.id': itemObj._id
	});
	return effortitem;
}

/********************************************************
Get one by filter
********************************************************/

exports.byID = async function(id) {
	let effortitem = await EffortItem.findOne({
		_id: id
	});
	return effortitem;
}
exports.byEffort = async function(effortObj) {
	let effortitem = await EffortItem.findOne({
		'effort.id': effortObj._id
	});
	return effortitem;
}
exports.byItem = async function(itemObj) {
	let effortitems = await EffortItem.find({
		'item.id': itemObj._id
	});
	return effortitems;
}
exports.byUser = async function(userObj) {
	let effortitems = await EffortItem.find({
		'user.id': userObj._id
	});
	return effortitems;
}
exports.byUserID = async function(userID) {
	let effortitems = await EffortItem.find({
		'user.id': userID
	}).exec();
	return effortitems;
}

/********************************************************
Create
********************************************************/

exports.save = async function(effortObj, itemObj, userObj) {
	let relation = new EffortItem({
		user: {
			id: userObj._id,
			username: userObj.username
		},
		effort: {
			id: effortObj._id
		},
		item: {
			id: itemObj._id,
			label: itemObj.label
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

exports.update = async function(relationObj, effortObj, itemObj) {
	// let relation = await exports.EffortItem.byId(id);
	relationObj.effort.id = effortObj._id 	|| relationObj.effort.id;
	relationObj.item.id = itemObj._id 		|| relationObj.item.id;
	relationObj.item.label = itemObj.label 	|| relationObj.item.label;
	let logMessage = "Updated relation: " + relationObj;
	await logs.save(logMessage);
	relationObj.save();
	return relationObj;
}

exports.updateById = async function(id, effortObj, itemObj) {
	let relationObj = await exports.EffortItem.byId(id);
	relationObj = await exports.update(relationObj, effortObj, itemObj);
	return relationObj;
}

/********************************************************
Destroy
********************************************************/

exports.deleteByID = async function(id) {
	let relation = await exports.EffortItem.byID(id);	
	exports.delete(relation);
	return relation;
}

exports.delete = async function(relationObj) {
	relationObj.delete();
	let logMessage = "Deleted relation: " + relationObj;
	await logs.save(logMessage);
	return relationObj;
}
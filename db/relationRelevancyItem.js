/********************************************************
Mongoose.js and MongoDB
********************************************************/
const mongoose = require('mongoose')

var url = process.env.DATABASEURL;
mongoose.connect(url, { useNewUrlParser: true , useUnifiedTopology: true});

const RelevancyItem = require("./../models/relationRelevancyItem");
const logs = require("./log.js");

/********************************************************
Get all
********************************************************/

exports.all = async function() {
	let res = await RelevancyItem.find({});
	return res;
}

/********************************************************
Get one
********************************************************/

exports.findOne = async function(relevancyObj, itemObj) {
	let res = await RelevancyItem.findOne({
		'relevancy.id': relevancyObj._id, 
		'item.id': itemObj._id
	});
	return res;
}

/********************************************************
Get by filter
********************************************************/

exports.byID = async function(id) {
	let res = await RelevancyItem.findOne({
		_id: id
	});
	return res;
}
exports.byRelevancy = async function(relevancyObj) {
	let res = await RelevancyItem.findOne({
		'relevancy.id': relevancyObj._id
	});
	return res;
}
exports.byItem = async function(itemObj) {
	let res = await RelevancyItem.findOne({
		'item.id': itemObj._id
	});
	return res;
}
exports.byUser = async function(userObj) {
	let res = await RelevancyItem.find({
		'user.id': userObj._id
	});
	return res;
}

/********************************************************
Create
********************************************************/

exports.save = async function(relevancyObj, itemObj, userObj) {
	let relation = new RelevancyItem({
		user: {
			id: userObj._id,
			username: userObj.username
		},
		relevancy: {
			id: relevancyObj._id
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

exports.update = async function(id, relevancyObj, itemObj) {
	let relation = await exports.RelevancyItem.byId(id);
	relation.relevancy.id = relevancyObj._id;
	relation.item.id = itemObj._id;
	relation.item.label = itemObj.label;
	relation.save();
	let logMessage = "Updated relation: " + relation;
	await logs.save(logMessage);
	return relation;
}

/********************************************************
Destroy
********************************************************/

exports.deleteByID = async function(id) {
	let relation = await exports.RelevancyItem.byID(id);	
	exports.delete(relation);
	return relation;
}

exports.delete = async function(relationObj) {
	relationObj.delete();
	let logMessage = "Deleted relation: " + relationObj;
	await logs.save(logMessage);
	return relationObj;
}
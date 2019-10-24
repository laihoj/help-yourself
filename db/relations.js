exports.itemItem 		= require("./relationItemItem.js");
exports.effortItem 		= require("./relationEffortItem.js");
exports.effortUser 		= require("./relationEffortUser.js");
exports.itemUser 		= require("./relationItemUser.js");
exports.relevancyItem 	= require("./relationRelevancyItem.js");
exports.relevancyUser 	= require("./relationRelevancyUser.js");

/*
const mongoose = require('mongoose')

var url = process.env.DATABASEURL;
mongoose.connect(url, { useNewUrlParser: true });

const RelevancyItem = require("./../models/relationRelevancyItem");
const EffortItem = require("./../models/relationEffortItem");
const RelevancyUser = require("./../models/relationRelevancyUser");
const ItemUser = require("./../models/relationItemUser");
const ItemItem = require("./../models/relationItemItem");
const EffortUser = require("./../models/relationEffortUser");





exports.RelevancyItem.all = async function() {
	return RelevancyItem.find({}).exec();
}
exports.EffortItem.all = async function() {
	return EffortItem.find({}).exec();
}
exports.RelevancyUser.all = async function() {
	return RelevancyUser.find({}).exec();
}
exports.ItemUser.all = async function() {
	return ItemUser.find({}).exec();
}
exports.ItemItem.all = async function() {
	return ItemItem.find({}).exec();
}
exports.EffortUser.all = async function() {
	return EffortUser.find({}).exec();
}



exports.RelevancyItem.findOne = async function(relevancyObj, itemObj) {
	return RelevancyItem.findOne({
		'relevancy.id':relevancyObj._id, 
		'item.id': itemObj._id
	}).exec();
}
exports.EffortItem.findOne = async function(effortObj, itemObj) {
	return EffortItem.findOne({
		'effort.id':effortObj._id, 
		'item.id': itemObj._id
	}).exec();
}
exports.RelevancyUser.findOne = async function(relevancyObj, userObj) {
	return RelevancyUser.findOne({
		'relevancy.id':relevancyObj._id, 
		'user.id': userObj._id
	}).exec();
}
exports.ItemUser.findOne = async function(itemObj, userObj) {
	return ItemUser.findOne({
		'item.id':itemObj._id, 
		'user.id': userObj._id
	}).exec();
}
exports.ItemItem.findOne = async function(parentObj, childObj) {
	return ItemItem.findOne({
		'parent.id':parentObj._id, 
		'child.id': childObj._id
	}).exec();
}
exports.EffortUser.findOne = async function(effortObj, userObj) {
	return EffortUser.findOne({
		'effort.id':effortObj._id, 
		'user.id': userObj._id
	}).exec();
}



exports.RelevancyItem.byID = async function(id) {
	return RelevancyItem.findOne({
		_id: id
	}).exec();
}
exports.RelevancyItem.byRelevancy = async function(relevancyObj) {
	return RelevancyItem.find({
		_id: relevancyObj.id
	}).exec();
}
exports.RelevancyItem.byItem = async function(itemObj) {
	return RelevancyItem.findOne({
		_id: itemObj.id
	}).exec();
}
exports.EffortItem.byID = async function(id) {
	return EffortItem.findOne({
		_id: id
	}).exec();
}
exports.EffortItem.byEffort = async function(effortObj) {
	return EffortItem.findOne({
		_id: effortObj.id
	}).exec();
}
exports.EffortItem.byItem = async function(itemObj) {
	return EffortItem.findOne({
		_id: itemObj.id
	}).exec();
}
exports.RelevancyUser.byID = async function(id) {
	return RelevancyUser.findOne({
		_id: id
	}).exec();
}
exports.RelevancyUser.byRelevancy = async function(relevancyObj) {
	return RelevancyUser.findOne({
		_id: relevancyObj.id
	}).exec();
}
exports.RelevancyUser.byUser = async function(userObj) {
	return RelevancyUser.findOne({
		_id: userObj.id
	}).exec();
}
exports.ItemUser.byID = async function(id) {
	return ItemUser.findOne({
		_id: id
	}).exec();
}
exports.ItemUser.byItem = async function(itemObj) {
	return ItemUser.findOne({
		_id: itemObj.id
	}).exec();
}
exports.ItemUser.byUser = async function(userObj) {
	return ItemUser.findOne({
		_id: userObj.id
	}).exec();
}
exports.ItemItem.byID = async function(id) {
	return ItemItem.findOne({
		_id: id
	}).exec();
}
exports.ItemItem.byParent = async function(parentObj) {
	return ItemItem.findOne({
		_id: parentObj.id
	}).exec();
}
exports.ItemItem.byChild = async function(childObj) {
	return ItemItem.findOne({
		_id: childObj.id
	}).exec();
}
exports.EffortUser.byID = async function(id) {
	return EffortUser.findOne({
		_id: id
	}).exec();
}
exports.EffortUser.byEffort = async function(effortObj) {
	return EffortUser.findOne({
		_id: effortObj.id
	}).exec();
}
exports.EffortUser.byUser = async function(userObj) {
	return EffortUser.findOne({
		_id: userObj.id
	}).exec();
}



exports.RelevancyItem.save = async function(relevancyObj, itemObj) {
	let relation = new RelevancyItem({
		relevancy: {
			id: relevancyObj._id
		},
		item: {
			id: itemObj._id,
			label: itemObj.label
		}
	});
	return relation.save();
}
exports.EffortItem.save = async function(effortObj, itemObj) {
	let relation = new EffortItem({
		effort: {
			id: effortObj._id
		},
		item: {
			id: itemObj._id,
			label: itemObj.label
		}
	});
	return relation.save();
}
exports.RelevancyUser.save = async function(relevancyObj, userObj) {
	let relation = new RelevancyUser({
		relevancy: {
			id: relevancyObj._id
		},
		user: {
			id: userObj._id,
			username: userObj.label
		}
	});
	return relation.save();
}
exports.ItemUser.save = async function(itemObj, userObj) {
	let relation = new ItemUser({
		item: {
			id: itemObj._id,
			label: itemObj.label
		},
		user: {
			id: userObj._id,
			username: userObj.label
		}
	});
	return relation.save();
}
exports.ItemItem.save = async function(parentObj, childObj) {
	let relation = new ItemItem({
		parent: {
			id: parentObj._id,
			label: parentObj.label
		},
		child: {
			id: childObj._id,
			label: childObj.label
		}
	});
	return relation.save();
}
exports.EffortUser.save = async function(itemObj, userObj) {
	let relation = new EffortUser({
		effort: {
			id: effortObj._id
		},
		user: {
			id: userObj._id,
			username: userObj.label
		}
	});
	return relation.save();
}



exports.RelevancyItem.update = async function(id, relevancyObj, itemObj) {
	let relation = await exports.RelevancyItem.byId(id);
	relation.relevancy.id = relevancyObj._id;
	relation.item.id = itemObj._id;
	relation.item.label = itemObj.label;
	return relation.save();
}
exports.EffortItem.update = async function(id, effortObj, itemObj) {
	let relation = await exports.EffortItem.byId(id);
	relation.effort.id = effortObj._id;
	relation.item.id = itemObj._id;
	relation.item.label = itemObj.label;
	return relation.save();
}
exports.RelevancyUser.update = async function(id, relevancyObj, userObj) {
	let relation = await exports.RelevancyUser.byId(id);
	relation.relevancy.id = relevancyObj._id;
	relation.user.id = userObj._id;
	relation.user.username = relevancyObj.username;
	return relation.save();
}
exports.ItemUser.update = async function(id, itemObj, userObj) {
	let relation = await exports.ItemUser.byId(id);
	relation.item.id = itemObj._id;
	relation.item.label = itemObj.label;
	relation.user.id = userObj._id;
	relation.user.username = relevancyObj.username;
	return relation.save();
}
exports.ItemItem.update = async function(id, parentObj, childObj) {
	let relation = await exports.ItemItem.byId(id);
	relation.parent.id = parentObj._id;
	relation.parent.label = parentObj.label;
	relation.child.id = childObj._id;
	relation.child.label = childObj.label;
	return relation.save();
}
exports.EffortUser.update = async function(id, effortObj, userObj) {
	let relation = await exports.EffortUser.byId(id);
	relation.effort.id = effortObj._id;
	relation.user.id = userObj._id;
	relation.user.username = relevancyObj.username;
	return relation.save();
}



exports.RelevancyItem.delete = async function(id) {
	let relation = await exports.RelevancyItem.byID(id);	
	return relation.delete();
}
exports.EffortItem.delete = async function(id) {
	let relation = await exports.EffortItem.byID(id);	
	return relation.delete();
}
exports.RelevancyUser.delete = async function(id) {
	let relation = await exports.RelevancyUser.byID(id);	
	return relation.delete();
}
exports.ItemUser.delete = async function(id) {
	let relation = await exports.ItemUser.byID(id);	
	return relation.delete();
}
exports.ItemItem.delete = async function(id) {
	let relation = await exports.ItemItem.byID(id);	
	return relation.delete();
}
exports.EffortUser.delete = async function(id) {
	let relation = await exports.EffortUser.byID(id);	
	return relation.delete();
}
*/
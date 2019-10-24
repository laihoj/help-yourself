/********************************************************
Mongoose.js and MongoDB
********************************************************/
const mongoose = require('mongoose')

var url = process.env.DATABASEURL;
mongoose.connect(url, { useNewUrlParser: true });

const EffortItem = require("./../models/relationEffortItem");

/********************************************************
Get all
********************************************************/

exports.all = async function() {
	return EffortItem.find({}).exec();
}

/********************************************************
Get one
********************************************************/

exports.findOne = async function(effortObj, itemObj) {
	return EffortItem.findOne({
		'effort.id':effortObj._id, 
		'item.id': itemObj._id
	}).exec();
}

/********************************************************
Get one by filter
********************************************************/

exports.byID = async function(id) {
	return EffortItem.findOne({
		_id: id
	}).exec();
}
exports.byEffort = async function(effortObj) {
	return EffortItem.findOne({
		'effort.id': effortObj._id
	}).exec();
}
exports.byItem = async function(itemObj) {
	return EffortItem.find({
		'item.id': itemObj._id
	}).exec();
}

/********************************************************
Create
********************************************************/

exports.save = async function(effortObj, itemObj) {
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

/********************************************************
Update
********************************************************/

exports.update = async function(id, effortObj, itemObj) {
	let relation = await exports.EffortItem.byId(id);
	relation.effort.id = effortObj._id;
	relation.item.id = itemObj._id;
	relation.item.label = itemObj.label;
	return relation.save();
}

/********************************************************
Destroy
********************************************************/

exports.delete = async function(id) {
	let relation = await exports.EffortItem.byID(id);	
	return relation.delete();
}
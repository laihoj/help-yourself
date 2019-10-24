/********************************************************
Mongoose.js and MongoDB
********************************************************/
const mongoose = require('mongoose')

var url = process.env.DATABASEURL;
mongoose.connect(url, { useNewUrlParser: true });

const ItemItem = require("./../models/relationItemItem");

/********************************************************
Get all
********************************************************/

exports.all = async function() {
	return ItemItem.find({}).exec();
}

/********************************************************
Get one
********************************************************/

exports.findOne = async function(parentObj, childObj) {
	return ItemItem.findOne({
		'parent.id':parentObj._id, 
		'child.id': childObj._id
	}).exec();
}

/********************************************************
Get one by filter
********************************************************/

exports.byID = async function(id) {
	return ItemItem.findOne({
		_id: id
	}).exec();
}
exports.byParent = async function(parentObj) {
	return ItemItem.findOne({
		_id: parentObj.id
	}).exec();
}
exports.byChild = async function(childObj) {
	return ItemItem.findOne({
		_id: childObj.id
	}).exec();
}

/********************************************************
Create
********************************************************/

exports.save = async function(parentObj, childObj) {
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

/********************************************************
Update
********************************************************/

exports.update = async function(id, parentObj, childObj) {
	let relation = await exports.ItemItem.byId(id);
	relation.parent.id = parentObj._id;
	relation.parent.label = parentObj.label;
	relation.child.id = childObj._id;
	relation.child.label = childObj.label;
	return relation.save();
}

/********************************************************
Destroy
********************************************************/

exports.delete = async function(id) {
	let relation = await exports.ItemItem.byID(id);	
	return relation.delete();
}
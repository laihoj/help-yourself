/********************************************************
Mongoose.js and MongoDB
********************************************************/
const mongoose = require('mongoose')

var url = process.env.DATABASEURL;
mongoose.connect(url, { useNewUrlParser: true });

const RelevancyItem = require("./../models/relationRelevancyItem");

/********************************************************
Get all
********************************************************/

exports.all = async function() {
	return RelevancyItem.find({}).exec();
}

/********************************************************
Get one
********************************************************/

exports.findOne = async function(relevancyObj, itemObj) {
	return RelevancyItem.findOne({
		'relevancy.id':relevancyObj._id, 
		'item.id': itemObj._id
	}).exec();
}

/********************************************************
Get one by filter
********************************************************/

exports.byID = async function(id) {
	return RelevancyItem.findOne({
		_id: id
	}).exec();
}
exports.byRelevancy = async function(relevancyObj) {
	return RelevancyItem.find({
		_id: relevancyObj.id
	}).exec();
}
exports.byItem = async function(itemObj) {
	return RelevancyItem.findOne({
		_id: itemObj.id
	}).exec();
}

/********************************************************
Create
********************************************************/

exports.save = async function(relevancyObj, itemObj) {
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

/********************************************************
Update
********************************************************/

exports.update = async function(id, relevancyObj, itemObj) {
	let relation = await exports.RelevancyItem.byId(id);
	relation.relevancy.id = relevancyObj._id;
	relation.item.id = itemObj._id;
	relation.item.label = itemObj.label;
	return relation.save();
}

/********************************************************
Destroy
********************************************************/

exports.delete = async function(id) {
	let relation = await exports.RelevancyItem.byID(id);	
	return relation.delete();
}
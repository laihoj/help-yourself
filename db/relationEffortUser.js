/********************************************************
Mongoose.js and MongoDB
********************************************************/
const mongoose = require('mongoose')

var url = process.env.DATABASEURL;
mongoose.connect(url, { useNewUrlParser: true });

const EffortUser = require("./../models/relationEffortUser");

/********************************************************
Get all
********************************************************/

exports.all = async function() {
	return EffortUser.find({}).exec();
}

/********************************************************
Get one
********************************************************/

exports.findOne = async function(effortObj, userObj) {
	return EffortUser.findOne({
		'effort.id':effortObj._id, 
		'user.id': userObj._id
	}).exec();
}

/********************************************************
Get by filter
********************************************************/

exports.byID = async function(id) {
	return EffortUser.findOne({
		_id: id
	}).exec();
}
exports.byEffort = async function(effortObj) {
	return EffortUser.findOne({
		'effort.id': effortObj._id
	}).exec();
}
exports.byUser = async function(userObj) {
	return EffortUser.find({
		'user.id': userObj._id
	}).exec();
}

/********************************************************
Create
********************************************************/

exports.save = async function(itemObj, userObj) {
	let relation = new EffortUser({
		effort: {
			id: effortObj._id
		},
		user: {
			id: userObj._id,
			username: userObj.username
		}
	});
	return relation.save();
}

/********************************************************
Update
********************************************************/

exports.update = async function(id, effortObj, userObj) {
	let relation = await exports.EffortUser.byId(id);
	relation.effort.id = effortObj._id;
	relation.user.id = userObj._id;
	relation.user.username = relevancyObj.username;
	return relation.save();
}

/********************************************************
Destroy
********************************************************/

exports.delete = async function(id) {
	let relation = await exports.EffortUser.byID(id);	
	return relation.delete();
}
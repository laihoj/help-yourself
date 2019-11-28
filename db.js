exports.users 		= require("./db/user.js");
exports.items 		= require("./db/item.js");
exports.efforts 	= require("./db/effort.js");
exports.relevancies = require("./db/relevancy.js");
exports.relations 	= require("./db/relations.js");
exports.logs 		= require("./db/log.js");
const utils = require('./utils.js');

exports.all = async function() {
	let efforts 				= await exports.efforts.all();
	let items 					= await exports.items.all();
	let relevancies 			= await exports.relevancies.all();
	let users 					= await exports.users.all();
	let itemItemRelations 		= await exports.relations.itemItem.all();
	let effortItemRelations 	= await exports.relations.effortItem.all();
	let relevancyItemRelations 	= await exports.relations.relevancyItem.all();
	let logs 					= await exports.logs.all();

	let data = {
		efforts: 				efforts,
		items: 					items,
		relevancies: 			relevancies,
		users: 					users,
		itemItemRelations: 		itemItemRelations,
		effortItemRelations: 	effortItemRelations,
		relevancyItemRelations: relevancyItemRelations,
		logs: 					logs
	}
	return data;
}

exports.getParent = async function(itemObj) {
	let parentofchild 	= await exports.relations.itemItem.byChild(itemObj);
	let parent = await exports.items.byID(parentofchild.parent.id);
	return parent;
}

exports.createItem = async function(label, userObj, parentId) {
	let item 	= await exports.saveItem(label, userObj, parentId);
	let relevancy = await exports.saveRelevancy(userObj, 99, item)
}

exports.createItemWithParentLabel = async function(label, userObj, parentLabel) {
	let parent = await exports.items.byLabel(parentLabel);
	// console.log(parent._id);
	let item;
	if(parent){
		item 	= await exports.saveItem(label, userObj, parent._id);
	} else {
		item 	= await exports.saveItem(label, userObj, "");
	}
	let relevancy = await exports.saveRelevancy(userObj, 99, item)
}


exports.saveItem = async function(label, user, parentId) {
	// console.log(parentId);
	let parent;
	let item = await exports.items.save(label, user);
	if (parentId) {
		// console.log("has parent ");
		parent = await exports.items.byID(parentId);
	}
	if(parent)
		exports.relations.itemItem.save(parent, item, user);
	return item;
}

//TODO: fix this shit
exports.getEffortsByItem = async function(itemObj) {
	let effortofitem 	= await exports.relations.effortItem.byItem(itemObj);
	var efforts = [];
	for(var i = 0; i < effortofitem.length; i++) {
		let effort = await exports.efforts.byID(effortofitem[i].effort.id);
		efforts.push(effort);
	}
	// Promise.all(promiseStack).then(function() {return efforts;});
	return efforts;
}

exports.saveEffortWithItemLabel = async function(hours, minutes, itemLabel, timestamp, user, note) {
	let itemObj = await exports.items.byLabel(itemLabel);
	// let effort = exports.saveEffort(hours, minutes, itemObj._id, timestamp, user, note, itemObj)

	let effort = await exports.efforts.save(hours, minutes, itemObj._id, timestamp, user, note);
	let effortitemrelation = await exports.relations.effortItem.save(effort, itemObj, user);
	return effort;
}

exports.saveEffort = async function(hours, minutes, itemId, timestamp, user, note, itemObj) {
	let effort = await exports.efforts.save(hours, minutes, itemId, timestamp, user, note);
	let effortitemrelation = await exports.relations.effortItem.save(effort, itemObj, user);
	await utils.updateItemTotalEffort2(itemObj);
	return effort;
}

exports.saveRelevancy = async function(user, value, itemObj) {
	let relevancyObj = await exports.relevancies.save(user, value);
	let relevancyitemrelation = await exports.relations.relevancyItem.save(relevancyObj, itemObj, user); 
	return relevancyObj;
}

exports.updateRelevancy = async function(relevancyObj, value) {
	let relevancy = await exports.relevancies.update(relevancyObj, value);
	let relevancyitemrelation = await exports.relations.relevancyItem.byRelevancy(relevancyObj); 
	let itemObj = await exports.items.byID(relevancyitemrelation.item.id); 
	await utils.updateItemTotalRelevancy(itemObj);
	// let relevancyitemrelation = await exports.relations.relevancyItem.save(relevancy, itemObj, user); 
	return relevancy;
}

exports.updateEffort = async function(effortObj, hours, minutes, timestamp, note) {
	let effort = await exports.efforts.update(effortObj, hours, minutes, timestamp, note);
	let effortitemrelation = await exports.relations.effortItem.byEffort(effortObj); 
	let itemObj = await exports.items.byID(effortitemrelation.item.id); 
	await utils.updateItemTotalEffort(itemObj);
	return effort;
}


	// await db.items.update(itemObj, itemObj.label, itemObj.effort, priority, totalRelevancy);

exports.updateItem = async function(itemObj, label, totalMinutes, priority, totalRelevancy, parentId) {
	let parentObj;
	let relationObj;
	itemObj = await exports.items.update(itemObj, label, totalMinutes, priority, totalRelevancy);
	// let itemObj = await exports.items.byIDAndUpdate(label, "", itemObj.user);
	if (parentId > 0)
		parentObj = await exports.items.byID(parentId);
	if(parentObj) {
		relationObj = exports.relations.itemItem.findOne(parentObj, itemObj);
		exports.relations.itemItem.update(relationObj, parentObj, itemObj);
	}
	// let logMessage = "Saved item: " + item;
	// await exports.logs.save(logMessage);
	return itemObj;
}

exports.deleteItem = async function(itemObj) {
	// let relations 		= await exports.relations.byItem(itemObj);
	
	// let relevancy 		= await exports.relevancies.byID(relevancyofitem.relevancy.id);
	let relevancyofitem = await exports.relations.relevancyItem.byItem(itemObj);
	let effortsofitem 	= await exports.relations.effortItem.byItem(itemObj);
	let childsofparent 	= await exports.relations.itemItem.byParent(itemObj);
	let parentofchild 	= await exports.relations.itemItem.byChild(itemObj);
	let effortofitem 	= await exports.relations.itemItem.byChild(itemObj);
	

	let relevancy;
	// let item = await exports.items.byID(relations.item.id);
	if(relevancyofitem) {
		if(relevancyofitem.relevancy) {
			relevancy = await exports.relevancies.byID(relevancyofitem.relevancy.id);
			await exports.relevancies.delete(relevancy);
			// relevancy.delete();
		}
		await exports.relations.relevancyItem.delete(relevancyofitem);
		// relevancyofitem.delete();
	}
	// if(relevancy)
	// 	relevancy.delete();
	if(effortsofitem)
		for(var i = 0; i < effortsofitem.length; i++)
			await exports.relations.effortItem.delete(effortsofitem[i]);
			// effortsofitem[i].delete();
	
	if(childsofparent)
		for(var i = 0; i < childsofparent.length; i++)
			await exports.relations.itemItem.delete(childsofparent[i]);
			// childsofparent[i].delete();
	if(parentofchild)
		await exports.relations.itemItem.delete(parentofchild);
		// parentofchild.delete();
	if(itemObj)
		await exports.items.delete(itemObj);
		// itemObj.delete();



}

exports.deleteEffort = async function(effortObj) {
	let effortofitem 		= await exports.relations.effortItem.byEffort(effortObj);
	let itemObj = await exports.items.byID(effortofitem.item.id); 
	if(effortofitem)
		exports.relations.effortItem.delete(effortofitem);
	
	if(effortObj)
		exports.efforts.delete(effortObj);

	await utils.updateItemTotalEffort(itemObj);
}

//basically builds the pointers
exports.buildItemRelations = async function(item) {
	if(item) {
		item.childs 	= [];
		item.efforts 	= [];

		relations = await exports.relations.byItem(item);
		if(relations.parentofchild) 
			item.parent = relations.parentofchild.parent;
		if(relations.childsofparent) 
			for (var i = 0; i < relations.childsofparent.length; i++) 
				item.childs.push(relations.childsofparent[i].child);
		if(relations.effortsofitem) 
			for (var i = 0; i < relations.effortsofitem.length; i++) 
				item.efforts.push(relations.effortsofitem[i].effort);
		if(relations.relevancyofitem) 
			item.relevancy = relations.relevancyofitem.relevancy;
	}
	return item;
}

//replace 'pointers' with the respective data
exports.populateItemData = async function(item) {
	if(item) {
		if(item.parent) {
			item.parent = await exports.items.byID(item.parent.id);
		} else {item.parent = {}}
		if(item.relevancy) {
			item.relevancy = await exports.relevancies.byID(item.relevancy.id);
		} else {item.relevancy = {}}
		if(item.childs) {
			for (var i = 0; i < item.childs.length; i++) {
				item.childs[i] = await exports.items.byID(item.childs[i].id);
				let relevancyrelation = await exports.relations.relevancyItem.byItem(item.childs[i]);
				item.childs[i].relevancy = await exports.relevancies.byID(relevancyrelation.relevancy.id);
			}
		} else {item.childs = {}}

		if(item.efforts) {
			for (var i = 0; i < item.efforts.length; i++) 
				item.efforts[i] = await exports.efforts.byID(item.efforts[i].id);
		} else {item.efforts = {}}
	}
	return item;
}


//basically builds the pointers
exports.buildEffortRelations = async function(effort) {
	// let item, user;
	relations = await exports.relations.byEffort(effort);
	if(relations.effortofitem) 
		effort.item = relations.effortofitem.item;
	return effort;
}

//replace 'pointers' with the respective data
exports.populateEffortData = async function(effort) {
	if(effort.item) {
		effort.item = await exports.items.byID(effort.item.id);
	} else {effort.item = {}}
	return effort;
}


exports.deleteUser = async function(userObj) {
	await exports.users.delete(userObj);
	return userObj;
}

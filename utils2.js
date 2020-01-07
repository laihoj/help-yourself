const db = require('./db.js');
const Effort = require("./models/effort");
const utils = require('./utils.js');

exports.refreshPriority = async function(userObj) {
	// let items;

	// items = await db.items.byUser(userObj);

	// for(let i = 0; i < items.length; i++) {
	// 	let priority, data, itemObj;
	// 	itemObj = items[i];
	// 	priority = itemObj.totalRelevancy * (24 * 60 * 7 - totalMinutes) / 60 / 100; //minutes in a week

	// 	data = {
	// 		priority: priority, 
	// 	};
	// 	return await db.updateItem2(itemObj, data);
	// }
}


exports.refreshTotalRelevancy = async function(userObj) {
	let list, items, itemObjs, relevancyObjs, itemsRelevancy, relevancyrelation;
	list = await utils.listifyItemRelations(userObj);
	items = await db.items.byUser(userObj);
	relevancies = await db.relevancies.byUser(userObj);
	relevancyrelations 	= await db.relations.relevancyItem.byUser(userObj);
	itemsRelevancy = {};
	itemsTotalRelevancy = {};
	itemObjs = {};
	relevancyObjs = {};
	for(let i = 0; i < items.length; i++) {
		let item = items[i];
		itemObjs[item.id] = item;
		itemsTotalRelevancy[item.id] = 100;
	}
	for(let i = 0; i < relevancies.length; i++) {
		let relevancy = relevancies[i];
		relevancyObjs[relevancy.id] = relevancy.value;
	}
	for(let i = 0; i < relevancyrelations.length; i++) {
		let relation = relevancyrelations[i];
		itemsRelevancy[relation.item.id] = relevancyObjs[relation.relevancy.id];
	}
	// for(let i = 0; i < list.length; i++) {
	// 	let id = list[i].id;
	// 	itemsTotalRelevancy[id] *= itemObjs
	// }

	// list = await utils.listifyItemRelations(userObj);
	for(let i = 0; i < list.length; i++) {
		let currentItemListed, 
			currentItemObj, 
			currentItemObjTotalRelevancy, 
			nextParentId;

		currentItemListed = list[i];
		currentItemObj = itemObjs[currentItemListed.id];
		currentItemObjTotalRelevancy = itemsRelevancy[currentItemObj.id];
		nextParentId = currentItemListed.parent;
		while(nextParentId) {
			let parentItemListed, parentItemObj;
			parentItemListed = list.filter(function(item) {
				return item['id'].equals(nextParentId);
			});
			if(parentItemListed.length > 0) {
				itemsTotalRelevancy[currentItemListed.id] *= itemsTotalRelevancy[currentItemListed.id] / 100;
				nextParentId = parentItemListed[0].parent;
			} else
				nextParentId = false;
		}
		currentItemObj.cumulativeMinutes += currentItemObj.totalMinutes;
	}

}

exports.refreshCumulativeMinutes = async function(userObj) {
	let items;

	//get correct cumulativeMinutes for all items
	let list, itemObjs, promiseStack, itemsCumulative;
	itemObjs = {};
	promiseStack = [];
	items = await db.items.byUser(userObj);
	itemsCumulative = {};
	for(let i = 0; i < items.length; i++) {
		let item = items[i];
		itemObjs[item.id] = item;
		itemsCumulative[item.id] = 0;
	}
		//for each item, accumulate time to each ancestor
	list = await utils.listifyItemRelations(userObj);
	for(let i = 0; i < list.length; i++) {
		let currentItemListed, 
			currentItemObj, 
			currentItemObjTotalMinutes, 
			nextParentId;

		currentItemListed = list[i];
		currentItemObj = itemObjs[currentItemListed.id];
		currentItemObjTotalMinutes = currentItemObj.totalMinutes;
		nextParentId = currentItemListed.parent;

		while(nextParentId) {
			itemsCumulative[nextParentId] += currentItemObjTotalMinutes;	
			let parentItemListed, parentItemObj;
			parentItemListed = list.filter(function(item) {
				return item['id'].equals(nextParentId);
			});
			if(parentItemListed.length > 0) {
				nextParentId = parentItemListed[0].parent;
			} else
				nextParentId = false;
		} 
	}
		//finally, accumulate own time to self

	
	for(let i = 0; i < items.length; i++) {
		let currentItemListed, currentItemObj, itemObj, data;


		currentItem = items[i];
		currentItemObj = itemObjs[currentItem.id];
		itemsCumulative[currentItemObj.id] += currentItemObj.totalMinutes;
		data = {
			cumulativeMinutes: itemsCumulative[currentItemObj.id]
		};
		await db.items.update2(currentItemObj, data);
	}
	for(let i = 0; i < items.length; i++) {
		let currentItem = items[i];
		console.log(currentItem.label + ": "+ itemsCumulative[currentItem.id]);
	}

}

exports.refreshTotalMinutes = async function(userObj) {
	let items;

	//get correct totalMinutes for all items
	items = await db.items.byUser(userObj);
	for(let i = 0; i < items.length; i++) {
		let totalMinutes, efforts, itemObj, data, j;

		totalMinutes = 0;
		itemObj = items[i];
		efforts = await db.getEffortsByItem(itemObj);

		for(j = 0; j < efforts.length; j++) {
			totalMinutes += efforts[j].hours * 60;
			totalMinutes += efforts[j].minutes;
		}

		data = {
			totalMinutes: totalMinutes,
		};

		await db.items.update2(itemObj, data);
	}
}

exports.resetMinutes = async function(userObj) {
	let items;


	//reset totalMinutes and cumulativeMinutes
	items = await db.items.byUser(userObj);
	for(let i = 0; i < items.length; i++) {
		let itemObj, data;
		itemObj = items[i];
		data = {
			totalMinutes: 0,
			cumulativeMinutes: 0,
		};

		await db.items.update2(itemObj, data);
	}
}

exports.refresh = async function(userObj) {
	// let items;


	//reset totalMinutes and cumulativeMinutes
	// exports.resetMinutes(userObj);
	// items = await db.items.byUser(userObj);
	// for(let i = 0; i < items.length; i++) {
	// 	let itemObj, data;
	// 	itemObj = items[i];
	// 	data = {
	// 		totalMinutes: 0,
	// 		cumulativeMinutes: 0,
	// 	};

	// 	await db.items.update2(itemObj, data);
	// }

	exports.refreshTotalMinutes(userObj);

	

	

	// //get correct totalMinutes for all items
	// items = await db.items.byUser(userObj);
	// for(let i = 0; i < items.length; i++) {
	// 	let totalMinutes, efforts, itemObj, data, j;

	// 	totalMinutes = 0;
	// 	itemObj = items[i];
	// 	efforts = await db.getEffortsByItem(itemObj);

	// 	for(j = 0; j < efforts.length; j++) {
	// 		totalMinutes += efforts[j].hours * 60;
	// 		totalMinutes += efforts[j].minutes;
	// 	}

	// 	data = {
	// 		totalMinutes: totalMinutes,
	// 	};

	// 	await db.items.update2(itemObj, data);
	// }

	exports.refreshCumulativeMinutes(userObj);

	

	// //get correct cumulativeMinutes for all items
	// let list, itemObjs, promiseStack, itemsCumulative;
	// itemObjs = {};
	// promiseStack = [];
	// items = await db.items.byUser(userObj);
	// itemsCumulative = {};
	// for(let i = 0; i < items.length; i++) {
	// 	let item = items[i];
	// 	itemObjs[item.id] = item;
	// 	itemsCumulative[item.id] = 0;
	// }
	// 	//for each item, accumulate time to each parent
	// list = await utils.listifyItemRelations(userObj);
	// for(let i = 0; i < list.length; i++) {
	// 	let currentItemListed, 
	// 		currentItemObj, 
	// 		currentItemObjTotalMinutes, 
	// 		nextParentId;

	// 	currentItemListed = list[i];
	// 	currentItemObj = itemObjs[currentItemListed.id];
	// 	currentItemObjTotalMinutes = currentItemObj.totalMinutes;
	// 	nextParentId = currentItemListed.parent;
	// 	while(nextParentId) {
	// 		let parentItemListed, parentItemObj;
	// 		parentItemListed = list.filter(function(item) {
	// 			return item['id'].equals(nextParentId);
	// 		});
	// 		if(parentItemListed.length > 0) {
	// 			// parentItemObj;
				
	// 			// parentItemObj = itemObjs[parentItemListed[0].id];
	// 			itemsCumulative[parentItemListed[0].id] += currentItemObjTotalMinutes;
	// 			// parentItemObj.cumulativeMinutes += currentItemObjTotalMinutes;
	// 			nextParentId = parentItemListed[0].parent;
	// 		} else
	// 			nextParentId = false;
	// 	}
	// 	currentItemObj.cumulativeMinutes += currentItemObj.totalMinutes;
	// }
	// 	//finally, accumulate own time to self
	// for(let i = 0; i < list.length; i++) {
	// 	let currentItemListed, currentItemObj, itemObj, data;


	// 	currentItemListed = list[i];
	// 	currentItemObj = itemObjs[currentItemListed.id];
	// 	// currentItemObj.cumulativeMinutes += currentItemObj.totalMinutes;
	// 	itemsCumulative[currentItemObj.id] += currentItemObj.totalMinutes;
	// 	data = {
	// 		cumulativeMinutes: itemsCumulative[currentItemObj.id]
	// 	};
	// 	await db.items.update2(currentItemObj, data);
	// }

	//get correct priorities for all items

	
	exports.refreshPriority(userObj);
}













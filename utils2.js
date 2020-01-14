const db = require('./db.js');
const Effort = require("./models/effort");
const utils = require('./utils.js');

//garbage function, dont use
exports.refreshPriority = async function(userObj) {
	let items;

	//get correct cumulativeMinutes for all items
	let list, itemObjs, promiseStack, itemsCumulative;
	itemObjs = {};
	itemPrios = {};
	promiseStack = [];
	items = await db.items.byUser(userObj);
	itemsCumulative = {};
	for(let i = 0; i < items.length; i++) {
		let item = items[i];
		itemObjs[item.id] = item;
		itemPrios[item.id] = 0;		//item priority lookup
		itemsCumulative[item.id] = item.cumulativeMinutes;
	}
		//for each item, accumulate time to each ancestor
	list = await utils.listifyItemRelations(userObj);
	//then calculate priorities for everything
	for(let i = 0; i < list.length; i++) {
		let currentItemListed, 
			currentItemObj, 
			currentItemObjTotalMinutes, 
			nextParentId;

		currentItemListed = list[i];
		currentItemObj = itemObjs[currentItemListed.id];
		currentItemObjTotalMinutes = currentItemObj.totalMinutes;
		nextParentId = currentItemListed.parent;

		if(nextParentId) {
			//update priority
			let parentRelevancy, selfPrio, cumulativeMinutes, relevancy;
			parentRelevancy = itemObjs[nextParentId].totalRelevancy;
			parentCumulativeMinutes = itemsCumulative[nextParentId];
			cumulativeMinutes = itemsCumulative[currentItemListed.id];
			relevancy = itemObjs[currentItemListed.id].totalRelevancy;
			// console.log(itemObjs[currentItemListed.id].label+": "+parentCumulativeMinutes +"*"+relevancy +"/"+cumulativeMinutes +"/"+parentRelevancy);

			if (cumulativeMinutes == 0 || parentRelevancy == 0)
				selfPrio = 0;
			else
				selfPrio = relevancy * parentCumulativeMinutes / cumulativeMinutes  / parentRelevancy;

			// console.log(selfPrio);
			itemPrios[currentItemListed.id] = selfPrio;

		}
	}

	//save calculations
	for(let i = 0; i < items.length; i++) {
		let currentItemListed, currentItemObj, itemObj, data;
		currentItem = items[i];
		currentItemObj = itemObjs[currentItem.id];
		data = {
			// cumulativeMinutes: itemsCumulative[currentItemObj.id],
			priority: itemPrios[currentItemObj.id]
		};
		promiseStack.push(db.items.update2(currentItemObj, data));
	}
	Promise.all(promiseStack).then(function() {});
}


//idk what this does? at least not save, thats for sure. NOT IN USE?
/*
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
*/

exports.refreshCumulativeMinutes = async function(userObj) {
	let items;

	//get correct cumulativeMinutes for all items
	let list, itemObjs, promiseStack, itemsCumulative;
	itemObjs = {};
	itemPrios = {};
	promiseStack = [];
	items = await db.items.byUser(userObj);
	itemsCumulative = {};
	for(let i = 0; i < items.length; i++) {
		let item = items[i];
		itemObjs[item.id] = item;
		itemPrios[item.id] = 0;		//item priority lookup
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
			//update cumulative minutes
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
	}

	//save calculations
	for(let i = 0; i < items.length; i++) {
		let currentItemListed, currentItemObj, itemObj, data;
		currentItem = items[i];
		currentItemObj = itemObjs[currentItem.id];
		data = {
			cumulativeMinutes: itemsCumulative[currentItemObj.id],
			// priority: itemPrios[currentItemObj.id]
		};
		promiseStack.push(db.items.update2(currentItemObj, data));
	}
	Promise.all(promiseStack).then(function() {});
}

exports.refreshTotalMinutes = async function(userObj) {
	let items, promiseStack;
	promiseStack = [];
	//get correct totalMinutes for all items
	items = await db.items.byUser(userObj);
	for(let i = 0; i < items.length; i++) {
		let totalMinutes, efforts, itemObj, data, j;

		totalMinutes = 0;
		itemObj = items[i];
		efforts = await db.getEffortsByItem(itemObj);


		let date = new Date();
		let week_ago = new Date();
		week_ago.setDate(date.getDate() - 7);
		let recent_efforts = efforts.filter(function(effort){
			let timeDate = new Date(effort.timestamp);
		    return timeDate >= week_ago ;
		});


		for(j = 0; j < recent_efforts.length; j++) {
			totalMinutes += recent_efforts[j].hours * 60;
			totalMinutes += recent_efforts[j].minutes;
		}

		data = {
			totalMinutes: totalMinutes,
		};

		promiseStack.push(db.items.update2(itemObj, data));
	}
	Promise.all(promiseStack).then(function() {});
}

//garbage, dont use
/*
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
*/

exports.refresh = async function(userObj) {
	exports.refreshTotalMinutes(userObj);
	exports.refreshCumulativeMinutes(userObj);	
	exports.refreshPriority(userObj);
}













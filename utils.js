const db = require('./db.js');

//credit: https://stackoverflow.com/a/22367819
//creates a tree structure of the item relations and returns this structure
exports.treeify = function(list) {
	let idAttr = 'id';
    let parentAttr = 'parent';
    let childrenAttr = 'children';

	var treeList = [];
    var lookup = {};
	list.forEach(function(obj) {
        lookup[obj[idAttr]] = obj;
        obj[childrenAttr] = [];
    });
    list.forEach(function(obj) {
        if (obj[parentAttr] != null && typeof lookup[obj[parentAttr]] !== 'undefined') {
            lookup[obj[parentAttr]][childrenAttr].push(obj);
        } else {
            treeList.push(obj);
        }
    });
    return treeList;
}

//todo: might not work when 
exports.updateItemTotalEffort2 = async function(itemObj) {
	let totalMinutes = 0;
	// let userID = itemObj.user.id;
	let efforts 		= await db.getEffortsByItem(itemObj);
	for(var i = 0; i < efforts.length; i++) {
		totalMinutes += efforts[i].hours * 60;
		totalMinutes += efforts[i].minutes;
	}
	let priority = itemObj.totalRelevancy * (8 * 60 * 5 - totalMinutes); //minutes of a work week


	await db.updateItem(itemObj, itemObj.label, totalMinutes, priority, itemObj.totalRelevancy);
}


exports.updateItemTotalEffort = async function(itemObj) {
	let totalMinutes = 0;
	let userID = itemObj.user.id;
	let efforts 		= await db.efforts.byUserID(userID);
	// console.log("efforts found: " +efforts);
	let effortsbyid = {};
	for(var i = 0; i < efforts.length; i++) {
		effortsbyid[efforts[i].id] = efforts[i];
	}

	let effortofitem 	= await db.relations.effortItem.byItem(itemObj);
	// console.log("relations found: " +effortofitem);
	let relationbyitemid = {};
	for(var i = 0; i < effortofitem.length; i++) {
		let itemid = effortofitem[i].item.id;
		let item = itemObj;
		let effortid = effortofitem[i].effort.id;
		totalMinutes += effortsbyid[effortid].hours * 60;
		totalMinutes += effortsbyid[effortid].minutes;
	}
	// let hours = Math.floor(totalMinutes / 60);
	// let minutes = totalMinutes % 60;
	// let message = hours + " h " + minutes;
	// itemObj.effort = totalMinutes;
	let priority = itemObj.totalRelevancy * (8 * 60 * 5 - totalMinutes); //minutes of a work week


	await db.updateItem(itemObj, itemObj.label, totalMinutes, priority, itemObj.totalRelevancy);
	// itemObj.save(); 
	// console.log("effort: " + message);
}

exports.updateItemTotalRelevancy = async function(itemObj) {
	let userID = itemObj.user.id;
	let totalRelevancy = 100;
	let currentItem = itemObj;
	let parentrelation;
	do {
		//update total relevancy
		let relevancyrelation 	= await db.relations.relevancyItem.byItem(currentItem);
		let relevancy 			= await db.relevancies.byID(relevancyrelation.relevancy.id);
		totalRelevancy 			= totalRelevancy * relevancy.value / 100;
		//if there is a parent, iterate again
		parentrelation 			= await db.relations.itemItem.byChild(currentItem);
		if (parentrelation) {
			currentItem 			= await db.items.byID(parentrelation.parent.id);
		} else currentItem = null;
	} while (currentItem);
	let priority = totalRelevancy * (8 * 60 * 5 - itemObj.totalMinutes); //minutes of a work week

	await db.updateItem(itemObj, itemObj.label, itemObj.totalMinutes, priority, totalRelevancy);
	return itemObj;
}


exports.setPriority = async function(item, priority) {
	item.priority  = priority;
}

exports.setMessage = async function(item, message) {
	item.message  = message;
}

//outdated
exports.assignPriority = async function(item) {
	
	let totalEffort = 0;
	let efforts = await db.efforts.byItem(item.label);
	let relevancy = 0;
	let categoryRelevancy = 0;
	let relevancies = await db.relevancies.byUser(item.user);
	for(let j = 0; j < relevancies.length; j++) {
		let label = relevancies[j].label;
		if(label === item.label) {
			relevancy = relevancies[j].value / 100;
			
		}
		if(label === item.category) {
			categoryRelevancy = relevancies[j].value / 100;
			
		}
	}
	// let relevanceByCategory = await db.relevances.byCategory(items[i].category); 
	//maybe fetch relevance once instead of per each item?
	for(var j = 0; j < efforts.length; j++) {
		totalEffort += efforts[j].hours * 60;
		totalEffort += efforts[j].minutes;
	}
	
	let hours = Math.floor(totalEffort / 60);
	let minutes = totalEffort % 60;
	let message = hours + " h " + minutes;
	totalRelevancy = relevancy * categoryRelevancy;	
	
	priority = totalRelevancy * (8 * 60 * 5 - totalEffort); //minutes of a work week
	item.priority  = priority;
	
	item.effort  = message;
	// console.log(item.label + " set to "+item);
	item.save();
	return item;
}

//outdated
exports.sortItemsByTotalEffort = async function (items) {
	//calculate total effort
	// console.log("Sorting: " + items);
	let globalEffort = 0;
	for(var i = 0; i < items.length; i++) {
		let totalEffort = 0;
		let efforts = await db.efforts.byItem(items[i].label);
		let relevancies = await db.relevancies.byUser(items[i].user);
		for(let j = 0; j < relevancies.length; j++) {
			let key = relevancies[j].label;
			if(key === items[i].label) {
				items[i].relevancy = relevancies[j].value / 100;
			}
			if(key === items[i].category) {
				items[i].categoryRelevancy = relevancies[j].value / 100;
			}
		}
		// let relevanceByCategory = await db.relevances.byCategory(items[i].category); 
		//maybe fetch relevance once instead of per each item?
		for(var j = 0; j < efforts.length; j++) {
			totalEffort += efforts[j].hours * 60;
			totalEffort += efforts[j].minutes;
			globalEffort += efforts[j].hours * 60;
			globalEffort += efforts[j].minutes;
			
		}
		let hours = Math.floor(totalEffort / 60);
		let minutes = totalEffort % 60;
		let message = hours + " h " + minutes;
		items[i].totalEffort = message;
		items[i].totalMinutes = totalEffort;
		items[i].totalRelevancy = items[i].relevancy * items[i].categoryRelevancy;	
	}
	for(var i = 0; i < items.length; i++) {
		items[i].priority  = items[i].totalRelevancy * (globalEffort - items[i].totalMinutes);
	}

	const PRIORITY = 1;
	const TOTALMINUTES = 2;
	let sortingBy = PRIORITY;
	if(items.length > 1) {
		var sorted = true;
		do {
			sorted = true;
			for(var i = 0; i < items.length - 1; i++) {
				var item_a = items[i];
				var item_b = items[i + 1];

				if(sortingBy === TOTALMINUTES) {
					if(item_a.totalMinutes > item_b.totalMinutes) {
						sorted = false;
						var a = item_a;
						items[i] = item_b;
						items[i + 1] = item_a;
					}
				}
				else if(sortingBy === PRIORITY) {
					if(item_a.priority < item_b.priority) {
						sorted = false;
						var a = item_a;
						items[i] = item_b;
						items[i + 1] = item_a;
					}
				} 
				else 
				{
					return items;
				}
			}
		} while(!sorted);
	}
	return items;
}


const db = require('./db.js');

exports.setPriority = async function(item, priority) {
	item.priority  = priority;
}

exports.setMessage = async function(item, message) {
	item.message  = message;
}

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
	
	item.message  = message;
	// console.log(item.label + " set to "+item);
	item.save();
	return item;
}

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


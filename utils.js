const db = require('./db.js');


exports.sortItemsByTotalEffort = async function (items) {
	//calculate total effort
	// console.log("Sorting: " + items);
	let globalEffort = 0;
	for(var i = 0; i < items.length; i++) {
		let totalEffort = 0;
		let efforts = await db.efforts.byItem(items[i].label);
		let relevance = await db.relevances.byUser(items[i].user);
		for(let j = 0; j < relevance.relevances.length; j++) {
			let key = relevance.relevances[j].key;
			if(key === items[i].label) {
				items[i].relevance = relevance.relevances[j].value / 100;
				// return relevance.relevances[i];
			}
			if(key === items[i].category) {
				items[i].categoryRelevance = relevance.relevances[j].value / 100;
				// return relevance.relevances[i];
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
		items[i].totalRelevance = items[i].relevance * items[i].categoryRelevance;	
	}
	for(var i = 0; i < items.length; i++) {
		items[i].priority  = items[i].totalRelevance * (globalEffort - items[i].totalMinutes);
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


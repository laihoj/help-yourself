const db = require('./db.js');
const Effort = require("./models/effort");
const utils = require('./utils.js');
const TreeModel = require('tree-model');

exports.tree2 = function(hashmap) {

	let tree = new TreeModel();

	let keys = Object.keys(hashmap);
	let nodes = {};
	let rootNode;

	//create a bunch of nodes
	for(let i = 0; i < keys.length; i++) {
		// let item = hashmap[keys[i]];
		let node = tree.parse(
			{
				id: keys[i]
			});
		nodes[keys[i]] = node;
	}

	//connect the nodes
	for(let i = 0; i < keys.length; i++) {
		let node = nodes[keys[i]];
		let childrenIds = hashmap[keys[i]].children;
		for(let j = 0; j < childrenIds.length; j++) {
			let id = childrenIds[j].id;
			let child = nodes[id];
			node.addChild(child);
		}
	}

	//find the root
	let rootAttempt = keys[0];
	let parent = hashmap[rootAttempt].parent;
	while(typeof hashmap[parent] !== 'undefined') {
		rootAttempt = hashmap[rootAttempt].parent;
		parent = hashmap[parent];
	}
	rootNode = nodes[rootAttempt];
	return rootNode;
}


//probably doesnt work. DOONT USE
exports.tree = function(flatList) {
	let tree = new TreeModel();
	let tree2 = new TreeModel();
	let treeNodes = [];
	let treeNodesById = {};
	for(let i = 0; i < flatList.length; i++) {
		let node = tree.parse(flatList[i]);
		treeNodes[i] = node;
		treeNodesById[node.id] = node; 
	}


	treeNodes.forEach((node) => {
		treeNodes[node.parent].addChild(node)
	});

	let rootNode;
	const res = treeNodes.filter((node) => (
		 node.isRoot()
	));
	rootNode = res[0];

	let data = {
		root: rootNode,

	}

	treeNodes = [];
	treeNodesById = {};
	// let root2 = tree2.parse(flatList.items);
	flatList.items.forEach((item) => {
		let node = tree.parse(flatList[i]);
		treeNodes[i] = node;
		treeNodesById[node.id] = node; 
	})


	treeNodes.forEach((node) => {
		if(node.parent)
			treeNodes[node.parent].addChild(node)
	});


	root2.walk(function (node) {
		console.log(node);
	    // Halt the traversal by returning false
	    // if (node.model.id === 121) return false;
	});
	
	// console.log(data);
	return root2;
}


exports.hashMap = async function(userObj) {
	let itemitem = await db.relations.itemItem.byUser(userObj);
	let list = [];
	let asd = {}
	let hashMap = {};

	itemitem.forEach(function(obj) {
		asd[obj.parent.id] = obj.parent.id;
		asd[obj.child.id] = obj.child.id;
	});
	let uniqueIds = Object.keys(asd);
	let newlist = [];

	uniqueIds.forEach(function(id) {
		let relationWhereThisIsChild = itemitem.filter((relation) => (relation.child.id).equals(id))[0];
		let parent;
		if(relationWhereThisIsChild && relationWhereThisIsChild.parent)
			parent = relationWhereThisIsChild.parent.id;
		let relationsWhereThisIsParent = itemitem.filter((relation) => (relation.parent.id).equals(id));
		let children = relationsWhereThisIsParent.map((relation) => ({id:relation.child.id}));
		let item = {
			parent: parent,
			children: children,
		}
		hashMap[id]= item;
	});


	return hashMap;
}

/*
input: (Object) user
output: [{id, label, parent}]
*/
exports.flatList = async function(userObj) {
	let itemitem = await db.relations.itemItem.byUser(userObj);
	let list = [];
	let asd = {}

	itemitem.forEach(function(obj) {
		let item = {};
		item['id'] = obj.child.id;
		item['label'] = obj.child.label;
		item['parent'] = obj.parent.id;
		list.push(item);
		asd[obj.parent.id] = obj.parent.id;
		asd[obj.child.id] = obj.child.id;
	});
	let uniqueIds = Object.keys(asd);
	let newlist = [];
	uniqueIds.forEach(function(id) {
		let relationWhereThisIsChild = itemitem.filter((relation) => (relation.child.id).equals(id))[0];
		let parent;
		if(relationWhereThisIsChild && relationWhereThisIsChild.parent)
			parent = relationWhereThisIsChild.parent.id;
		let relationsWhereThisIsParent = itemitem.filter((relation) => (relation.parent.id).equals(id));
		let children = relationsWhereThisIsParent.map((relation) => ({id:relation.child.id}));
		// let parent = itemitem.filter((relation) => (relation.child.id).equals(id))[0];
		// let children = itemitem.filter((relation) => (relation.parent.id).equals(id));
		let item = {
			id: id,
			parent: parent,
			children: children,
		}
		newlist.push(item);
	});

	let data = {
		// ids:  uniqueIds,
		items: newlist,
		// oldList: list
	}

	return data;
}


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


exports.refresh = async function(userObj) {
	exports.refreshTotalMinutes(userObj);
	exports.refreshCumulativeMinutes(userObj);	
	exports.refreshPriority(userObj);
}













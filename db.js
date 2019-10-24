exports.users 		= require("./db/user.js");
exports.categories 	= require("./db/category.js");
exports.items 		= require("./db/item.js");
exports.efforts 	= require("./db/effort.js");
exports.relevancies = require("./db/relevancy.js");
exports.relations 	= require("./db/relations.js");


exports.byItem = async function(item) {

	let relations = await exports.relations.byItem(item);
	let parent, childs, user, efforts, relevancy;
	if(relations.parent) {
		parent 		= await exports.items.byID(relations.parent.id);
	}
	
	if(relations.user) {
		user 		= await exports.users.byID(relations.user.id);
	}
	if(relations.efforts) {
		efforts 	= [];
		for (var i = 0; i < relations.efforts.length; i++) {
				let dataeffort = await exports.efforts.byID(relations.efforts[i].effort.id);
				efforts.push(dataeffort);
			
		};
	}

	if(relations.relevancy) {
		relevancy = await exports.relevancies.byID(relations.relevancy.id);
	}


	if(relations.childs) {
		childs = [];
		for (var i = 0; i < relations.childs.length; i++) {
			let datachild = await exports.items.byID(relations.childs[i].child.id);
			childs.push(datachild);
		};
	}

	let data = {
		parent: 		parent,
		childs: 		childs,
		user: 			user,
		efforts: 		efforts,
		relevancy: 		relevancy
	}

	return data;
}
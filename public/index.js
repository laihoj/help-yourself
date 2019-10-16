var bodyOnLoad = function() {
	// loadRelevanciesToCookie();
	loadRelevanceSlidersFromCookie();
}

var loadRelevanciesToCookie = async function() {
	// const url='/api/relevances';

	// const response = await fetch(url);
	// const myJson = await response.json();
	// return myJson;
		//.then(res=>{return res});
	const Http = new XMLHttpRequest();
	const url='/api/relevances';
	Http.open("GET", url);
	Http.send();

	Http.onreadystatechange = function()  {
	  	// console.log(Http.responseText);
	  	var obj = JSON.parse(Http.responseText);
	  	console.log(obj);
	  	for(var i = 0; i < obj.relevances.length; i++) {
	  		setCookie(obj.relevances.key, obj.relevances.value,  Date.now() + (10 * 365 * 24 * 60 * 60));
	  	}
	  	// return Http.responseText;
	  	
	}
}

var httpOnReadyStateChangeHandler = function() {
	  	// console.log(Http.responseText);
	  	var obj = JSON.parse(Http.responseText);
	  	console.log(obj);
	  	for(var i = 0; i < obj.relevances.length; i++) {
	  		setCookie(obj.relevances.key, obj.relevances.value,  Date.now() + (10 * 365 * 24 * 60 * 60));
	  	}
	  	// return Http.responseText;
	  	
	}



var loadRelevanceSlidersFromCookie = function() {
	var sliders = document.getElementsByClassName("slider");
	Array.prototype.forEach.call(sliders, function(slider, index) {
		slider.value = getCookie(slider.id);
	});
}


var updateRelevance = function(item_label) {
	var relevance = document.getElementById(item_label+"_relevance");
	setCookie(item_label+"_relevance", relevance.value, Date.now() + (10 * 365 * 24 * 60 * 60));
}

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}
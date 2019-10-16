var bodyOnLoad = function() {
	loadRelevanceSlidersFromCookie();
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
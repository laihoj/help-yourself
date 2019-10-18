function getTotalMinutes() {
	var hours = document.getElementsByClassName("hours");
	var minutes = document.getElementsByClassName("minutes");
	var total = 0;
	for(var i = 0; i < hours.length; i++) {
		total += parseInt(hours[i].innerText) * 60;
	}
	for(var i = 0; i < minutes.length; i++) {
		total += parseInt(minutes[i].innerText);
	}
	return total;
}


function getRelevanciesFromFooter() {
  var data = document.getElementsByClassName("relevancyData");
  for(var i = 0; i < data.length; i++) {
    var text = data[0].innerText;
    var res = text.split(":");
    var key = res[0];
    var value = res[1];
    setCookie(key, value, Date.now() + (10 * 365 * 24 * 60 * 60));
  }

}

function getRelevancesFromFooter() {
	var data = document.getElementsByClassName("relevanceData");
	for(var i = 0; i < data.length; i++) {
		var text = data[0].innerText;
		var res = text.split(":");
		var key = res[0];
		var value = res[1];
		setCookie(key, value, Date.now() + (10 * 365 * 24 * 60 * 60));
	}

}

var loadRelevanceSlidersFromFooter = function() {
	var sliders = document.getElementsByClassName("slider");
	Array.prototype.forEach.call(sliders, function(slider, index) {
		var key = slider.id.split("_")[0] + "_key";
		// var value = parseInt(document.getElementById(key).innerText);
		// slider.value = value;
		slider.value = getValueByKeyFromFooter(key);
	});
}

var loadRelevanciesSlidersFromFooter = function() {
  var sliders = document.getElementsByClassName("slider");
  Array.prototype.forEach.call(sliders, function(slider, index) {
    var key = slider.id.split("_")[0] + "_key";
    // var value = parseInt(document.getElementById(key).innerText);
    // slider.value = value;
    var newValue = getValueByKeyFromFooter(key);
    if(newValue == null) 
    {
      
    } else {
      slider.value = newValue;
    }
  });
}

function getValueByKeyFromFooter(key) {
  if(key == null)  {
  	return null;
  } else {
    var element = document.getElementById(key)
    if(element == null) {
      return null;
    } else {
      return parseInt(element.innerText);
    }
    
  }
  
}

var bodyOnLoad = function() {
	// loadRelevanciesToCookie();
	// loadRelevanceSlidersFromCookie();
	// loadRelevanceSlidersFromFooter();
  loadRelevanciesSlidersFromFooter();
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

function removeClassNameFromEachElement(className, elementList) {
  for(var i = 0; i < elementList.length; i++) {
    elementList[i].classList.remove(className);
  }
}

function sortTable(id, n, numeric, direction) {
  var table, headers, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
  table = document.getElementById(id);
  headers = table.getElementsByTagName("TH");
  removeClassNameFromEachElement("sorted-ascending", headers);
  removeClassNameFromEachElement("sorted-descending", headers);
  header = table.getElementsByTagName("TH")[n];
  switching = true;
  // Set the sorting direction to ascending:
  if(direction) {
    dir = direction;
  } else {
    dir = "asc";
  }
  
  /* Make a loop that will continue until
  no switching has been done: */
  while (switching) {
    // Start by saying: no switching is done:
    switching = false;
    rows = table.getElementsByTagName("TR");
    /* Loop through all table rows (except the
    first, which contains table headers): */
    for (i = 1; i < (rows.length - 1); i++) {
      // Start by saying there should be no switching:
      shouldSwitch = false;
      /* Get the two elements you want to compare,
      one from current row and one from the next: */
      x = rows[i].getElementsByTagName("TD")[n];
      y = rows[i + 1].getElementsByTagName("TD")[n];
      /* Check if the two rows should switch place,
      based on the direction, asc or desc: */
      if (dir == "asc") {
        if(numeric) {
          if (Number(x.innerHTML) > Number(y.innerHTML)) {
            shouldSwitch = true;
            break;
          }
        } else if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
          // If so, mark as a switch and break the loop:
          shouldSwitch = true;
          break;
        }
      } else if (dir == "desc") {
        if(numeric) {
          if (Number(x.innerHTML) < Number(y.innerHTML)) {
            shouldSwitch = true;
            break;
          }
        } else if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
          // If so, mark as a switch and break the loop:
          shouldSwitch = true;
          break;
        }
      }
    }
    if (shouldSwitch) {
      /* If a switch has been marked, make the switch
      and mark that a switch has been done: */
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
      // Each time a switch is done, increase this count by 1:
      switchcount ++; 
    } else {
      /* If no switching has been done AND the direction is "asc",
      set the direction to "desc" and run the while loop again. */
      if (switchcount == 0 && dir == "asc") {
        dir = "desc";
        switching = true;
        header.classList.add("sorted-descending");
      } else {
        header.classList.add("sorted-descending");
      }
    }
  }
}
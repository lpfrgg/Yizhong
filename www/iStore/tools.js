// JavaScript Document

function checkStatusBar(){
	//console.log("checkStatusBar");
	if (navigator.userAgent.match(/(iPad.*|iPhone.*|iPod.*);.*CPU.*OS 7_\d/i)) {
		console.log("addStatusBar");
		
		
		$("body").addClass("ios7");
		$("body").append('<div id="ios7statusbar" data-transition="none"/>');
		$("body").addClass("ios7");
		//$("#fakeStatusBar").css({ "height": "20px" });
		$("#subMenuPage").css({ "margin-top": "20px" });
	}else{
		$("#fakeStatusBar").css({ "height": "0" });
	}
}

function showObj(way, obj){
	//alert("showJson = " + obj);
	var tempStr = "\n=====showObject tool========\n";
	tempStr += "=== Typeof Data = " + typeof(obj) + " =====\n"
	
	if(typeof(obj) == "object"){
		//alert("showJson obj = object\n" + obj);
		$.each( obj, function( name, value ){
			/*
			if( value && value.length > 10){
				//alert(">10 = " + name);
				tempStr += name + ":" + value.slice(0,9) + "\n";
			}else{
				tempStr += name + ":" + value + "\n";
			}
			*/
			tempStr += name + ":" + value + "\n";
		});
	}else{
		//alert("showJson obj != object\n" + obj);
		tempStr += obj + "\n";
	}
	
	tempStr += "=============";
	if( way == "console" || way == 1 || way == "1"){
		console.log(tempStr);
	}else{
		alert(tempStr);
	}
}

function getMyPosition() {
	//alert("getMyPosition");
	
	if (navigator.geolocation) {
           navigator.geolocation.getCurrentPosition(success, geolocationError);
        }

	//Get the latitude and the longitude;
	function success(position) {
		myPos = new google.maps.LatLng( position.coords.latitude,
										position.coords.longitude);
		myLat = position.coords.latitude;
		myLng = position.coords.longitude;
		getStoreList();
	}

	function geolocationError(){
		console.log("navigator.geolocation failed");
	}
}

function countJson(json, type){	
	//alert( "get the data = " + json);
	
	var count = 0;
	if(type != "json" && type != "Json" && type != "JSON"){
		json =  JSON.parse(json);
	}
	
	for(var key in json){
		if(json.hasOwnProperty(key)){
			count++;
		}
	}
			
	return count;
}

function setListCell(data){
	//showObj(1, data);
    //console.log("length of name = %d, %s", data.name.length, data.name);
	var tempStr = "";
	
	tempStr += "<li onClick='getStoreId(this)' id=" + data.store_id + ">";
	tempStr += "<a class='listLink' data-transition='slide' data-direction='right' href='#storePage'>";
	//tempStr += "<img id='list_img' src=img/listView.png>";
	tempStr += "<img id='list_img' src=" + data.image + ">";
	tempStr += "<p class='storeList_text' id='list_storeType'>" + data.store_type + "</p>";
	tempStr += "<p class='storeList_text' id='list_storeName'>" + data.name + "</p>";
	tempStr += "<p class='storeList_text' id='list_distance'>" + data.Distance + "公尺</p>";
	tempStr += "<p class='storeList_text' id='list_addr'>" + data.addr + "</p>";
	tempStr += "</a>";
	tempStr += "<div class='deletBtn' value='" + data.store_id + "'>Delet</div>"
	tempStr += "</li>";
	
	return tempStr;
}

function distance(lat1, lon1, lat2, lon2, unit) {
	var radlat1 = Math.PI * lat1/180;
	var radlat2 = Math.PI * lat2/180;
	var radlon1 = Math.PI * lon1/180;
	var radlon2 = Math.PI * lon2/180;
	var theta = lon1-lon2;
	var radtheta = Math.PI * theta/180;
	var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
	
	dist = Math.acos(dist);
	dist = dist * 180/Math.PI;
	dist = dist * 60 * 1.1515;
	if (unit=="K" || unit=="Km" || unit=="KM") { dist = dist * 1.609344 }
	if (unit=="M" || unit=="m" ) { dist = dist * 1.609344 * 1000}
	if (unit=="N") { dist = dist * 0.8684 }
	return dist;
}

function readFromFile(fileName, flg){
	var tempStr;
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);
	//showObj(1, dataStr);

		function gotFS(fileSystem) {
			//console.log("fileSystem.name = %s", fileSystem.name);
        	//console.log("fileSystem.root.name = %s",fileSystem.root.name);
			fileSystem.root.getFile(fileName, {create: true, exclusive: false}, gotFileEntry, fail);
		}
		
		function gotFileEntry(fileEntry) {
        	fileEntry.file(gotFile, fail);
    	}

	
		function gotFile(file){
			//readDataUrl(file);
			readAsText(file);
		}
	
		function readDataUrl(file) {
			var reader = new FileReader();
			reader.onloadend = function(evt) {
				console.log("Read as data URL");
				console.log(evt.target.result);
			};
			reader.readAsDataURL(file);
		}
	
		function readAsText(file) {
			var reader = new FileReader();
			reader.onloadend = function(evt) {
				console.log("Read as text -- success");
				//console.log("read success = %s", evt.target.result);
				if(flg == "h" || flg == "H"){
					historyStr = evt.target.result;
				}else if(flg =="f" || flg == "F"){
					favoriteStr = evt.target.result;
				}
			};
			reader.readAsText(file);
		}
	
		function fail(error) {
			console.log(error.code);
		}
}

function writeToFile(fileName, data){
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);

    function gotFS(fileSystem) {
        fileSystem.root.getFile(fileName, {create: true, exclusive: false}, gotFileEntry, fail);
    }

    function gotFileEntry(fileEntry) {
        fileEntry.createWriter(gotFileWriter, fail);
    }

    function gotFileWriter(writer) {
        writer.onwriteend = function(evt) {
            console.log("success");
        };
        writer.write(data);
    }

    function fail(error) {
        console.log(error.code);
    }
}

function addMarksForMap(markerLatLog, markerTitle, action, items) {
	//alert("addMoreMarkForMap");
	
	var contentString;
	if(items){
		
		contentString =
		'<div class="mapInfoWindow" onClick="getStoreId(this)">'+
		'<a href="#storePage">'+
		'<div class="mapStoreName" value="' + items.store_id + '">'+ items.name + '</div></a>'+
		'<div>'+ items.addr +'</div>'+
		'<div>'+ items.tel+
		'</div>';
		
	}else{
		contentString = markerTitle;
	}
	//console.log("contentStr = %s", contentString);
	//set marker
	var animationStr;
	var pinColor;
	if(action == "BOUNCE"){
		animationStr = "google.maps.Animation.BOUNCE";
		pinColor = "FE7569";
	}else{
		animationStr = "google.maps.Animation.DROP";
		pinColor = "08BA84";
	}
	
	var pinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pinColor,
        new google.maps.Size(21, 34),
        new google.maps.Point(0,0),
        new google.maps.Point(10, 34));
	
	var marker = new google.maps.Marker({
		position: markerLatLog,
		map: map,
		title: markerTitle,
		icon: pinImage
		});

	if(action == "BOUNCE"){
		marker.setAnimation(google.maps.Animation.BOUNCE);
	}else{
		marker.setAnimation(google.maps.Animation.DROP);
	}
		
	//set infon window
	//alert( contentString );

	//add event to open window
	google.maps.event.addListener( marker, 'click', function() {
				
		if(pre_infoWindow){
			console.log("close inforWindow");
			pre_infoWindow.close();
		}
		
		var infoWindow = new google.maps.InfoWindow({ content: contentString });
		//console.log("clik on marker. = %s", infoWindow);
		pre_infoWindow = infoWindow;
		infoWindow.open(marker.get('map'), marker);
	});
}


/* useless
function _to_utf8(s) {
  var c, d = "";
  for (var i = 0; i < s.length; i++) {
    c = s.charCodeAt(i);
    if (c <= 0x7f) {
      d += s.charAt(i);
    } else if (c >= 0x80 && c <= 0x7ff) {
      d += String.fromCharCode(((c >> 6) & 0x1f) | 0xc0);
      d += String.fromCharCode((c & 0x3f) | 0x80);
    } else {
      d += String.fromCharCode((c >> 12) | 0xe0);
      d += String.fromCharCode(((c >> 6) & 0x3f) | 0x80);
      d += String.fromCharCode((c & 0x3f) | 0x80);
    }
  }
  return d;
}

function _from_utf8(s) {
  var c, d = "", flag = 0, tmp;
  for (var i = 0; i < s.length; i++) {
    c = s.charCodeAt(i);
    if (flag == 0) {
      if ((c & 0xe0) == 0xe0) {
        flag = 2;
        tmp = (c & 0x0f) << 12;
      } else if ((c & 0xc0) == 0xc0) {
        flag = 1;
        tmp = (c & 0x1f) << 6;
      } else if ((c & 0x80) == 0) {
        d += s.charAt(i);
      } else {
        flag = 0;
      }
    } else if (flag == 1) {
      flag = 0;
      d += String.fromCharCode(tmp | (c & 0x3f));
    } else if (flag == 2) {
      flag = 3;
      tmp |= (c & 0x3f) << 6;
    } else if (flag == 3) {
      flag = 0;
      d += String.fromCharCode(tmp | (c & 0x3f));
    } else {
      flag = 0;
    }
  }
  return d;
}
*/
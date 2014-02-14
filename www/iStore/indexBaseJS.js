// JavaScript Document
var myPos, myLat, myLng;
var storeListStr;
var storeId;
var historyStr = "", favoriteStr = ""; /*str read from file*/
var pre_infoWindow = null;	/*for map infoWindow*/

document.addEventListener("deviceready", onDeviceReady(), false);    //-->for mobile device

function onDeviceReady(){
	//alert("onDeviceReady");
	$(document).on("pagebeforeshow", "#storeListPage", function(e){ storeListPageInit(); });
	$(document).on("pagebeforeshow", "#storePage", function(e){ storePageInit(); });
	$(document).on("pageshow", "#mapPage", function(e){ mapPageInit(); });
	$(document).on("pageshow", "#mapPage2", function(e){ mapPageInit2(); });
	
	$(document).on("pagebeforeshow", "#historyPage", function(e){ historyPageInit(); });
	$(document).on("pagebeforeshow", "#favoritePage", function(e){ favoritePageInit(); });
	
	$(document).on("click", "#menuButton", function(e){ subMenuHandler(1); });
	$(document).on("input keyup", ".searchInput", function(e){ searchHandler(e, this); });
	
	$(document).on( "pagehide", "#storePage", function(e){ $("#storePage #scroller1").off();
														   $("#storeInfo").off();
														 });													 
	$(document).on( "pagehide", "#favoritePage", function(e){ $(document).off("swipeleft swiperight", "#favoriteList li");
															  $(document).off("click", ".deletBtn");
															  $.event.special.swipe.horizontalDistanceThreshold = 30;
															  console.log("remove swipeHandler");
														 });
	
	$(document).on( "pagehide", "#mapPage", function(e){ //google.maps.event.clearInstanceListeners(window);
														 //google.maps.event.clearInstanceListeners(document);
														 google.maps.event.clearInstanceListeners("#map-canvas"); 
														 });
														 
	$(window).bind("unload", function() {
		consloe.log("clear");
		if (typeof GUnload == "function") {
			GUnload();
		}
	});
	
	$(window).load(function(e) {
        console.log("pageLoaded!");
    });
	
	$.mobile.defaultPageTransition = "slide";
	
	//$(document).on("pageshow", function(e){ setTimeout( "$('#subMenuPage').css({ 'left' : '-80%' })", 500); });
}

function deletSwipeHandler( target, e){
	//showObj(1, e);
	//console.log("cancelSwipeHandler = %s", $(target).height());
	var targetHeight = $(target).height();
	if(e.type == "swipeleft"){
		console.log("add deletBtn. targetHeight = %s", targetHeight);
		if( $(".deletBtn", target).width() == 0 ){
			$(".deletBtn").animate({ width: 0});
			$(".listLink").animate({ left: 0 });

			$(".deletBtn", target).animate({ width: targetHeight });
			$(".listLink", target).animate({ left: -(targetHeight) });
		}
	}else{
		console.log("remove deletBtn");
		$(".deletBtn").animate({ width: 0 });
		$(".listLink", target).animate({ left: 0 });
	}
}

function deletHandler( target, e){
	//console.log("Ready to Delet = %s", $(target).attr("value") );
	var deletStoreId = $(target).attr("value");
	var listObj = $.parseJSON(favoriteStr);
	var tempStr = "";
	//console.log("check = %s", countJson(listObj, "json") );
	
	$.each( listObj, function(key, value){
		if( value.store_id == deletStoreId){
			delete listObj[key];
			$("#favoriteList").html("");
			return false;
		}
	});
	
	favoriteStr = JSON.stringify(listObj);
	console.log("check = %s", favoriteStr);
	writeToFile("favorite.txt", favoriteStr);
	
	if(favoriteStr == "" || favoriteStr == "{}"){
		$("#favoriteList").listview("refresh");
		alert("目前沒有收藏任何店家");
		$.mobile.changePage( "#storeListPage", { transition: "slide", changeHash: false });
	}else{
		$.each( listObj, function(key, value){
				tempStr += setListCell(value);
			});
		console.log("tempStr = %s", tempStr);
		$("#favoriteList").html(tempStr);
		$("#favoriteList").listview("refresh");
	}
}

function storeListPageInit(){
	//alert("storeListPageInit");
	checkStatusBar();
	getMyPosition();
	readFromFile("history.txt", "h");
	readFromFile("favorite.txt", "f");
	
	var windowHeight = $(window).height();
	var logoHeight = $("#logoArea").height();
	var statusBarHeight = $("#ios7statusbar").height();
	var menuHeight = windowHeight - logoHeight - statusBarHeight;
	
	console.log("menuHeight = %s", menuHeight);
	$("#menuArea").css({ "height": menuHeight });

}

function mapPageInit2(){
	console.log("mapPageInit2");
	$("#map-canvas2").tinyMap({
        center: {
            x: "24.1538723",
            y: "120.6870146"
        },
        zoom: 16,
		contorl: false,
		disableDefaultUI: true,
		mapTypeControl: false,
		panControl: false,
		streetViewControl: false,
		navigationControl: false,
		zoomControl: false,
		marker: [{addr: ["24.1538723","120.6870146"], text: "一中街商圈", icon:"img/myLocationIcon2.png"}]
    });
}

function historyPageInit(){
	//console.log("historyPageInit = %s", historyStr );
	if( historyStr == ""){
		alert("目前未流覽任何店家");
		window.history.back();
	}else{
		$("#historyList").html("");
		//checkStatusBar();
		var tempStr = "";
		var tempData = $.parseJSON(historyStr);
		
		$.each( tempData, function(key, value){
			tempStr += setListCell(value);
		});
		//console.log("tempStr = \n %s", tempStr);
		$("#historyList").html(tempStr);
		$("#historyList").listview("refresh");
	}
}

function favoritePageInit(){
	console.log("favoritePageInit = %s", favoriteStr);
	$(document).on( "swipeleft swiperight", "#favoriteList li", function(event){ deletSwipeHandler(this, event); });
	$(document).on( "click", ".deletBtn", function(event){ deletHandler(this, event); });
	$.event.special.swipe.horizontalDistanceThreshold = 100;
	
	if( !favoriteStr || favoriteStr == "" || favoriteStr == "{}"){
		alert("目前沒有收藏任何店家");
		window.history.back();
	}else{
		$("#favoriteList").html("");
		//checkStatusBar();
		var tempStr = "";
		var tempData = $.parseJSON(favoriteStr);
		
		$.each( tempData, function(key, value){
			tempStr += setListCell(value);
		});
		//console.log("tempStr = \n %s", tempStr);
		$("#favoriteList").html(tempStr);
		$("#favoriteList").listview("refresh");
	}
}

function buildMap(){
	alert("buildMap");
	//checkStatusBar();
	var mapWidth = $(window).width() + "px";
	var mapHeight = $(window).height() + "px";
	var infoWindow;
	
	myPos = new google.maps.LatLng( 24.1538723, 120.6870146 );
	
	$("#map-canvas").css({ "width":mapWidth, 
						   "height":mapHeight,
						   "margin": 0,
						   "padding": 0 });
	
	var mapOptions = { zoom: 17,
					   center: myPos,
					   mapTypeId: google.maps.MapTypeId.ROADMAP,
					   disableDefaultUI: true };

	var map = new google.maps.Map(document.getElementById('map-canvas'),
								  mapOptions);
}

function mapPageInit(){
	//alert("mapPageInit");
	var mapWidth = $(window).width() + "px";
	var mapHeight = $(window).height() + "px";
	var infoWindow;
	
	myPos = new google.maps.LatLng( 24.1538723, 120.6870146 );

	$("#map-canvas").css({ "width":mapWidth, 
						   "height":mapHeight,
						   "margin": 0,
						   "padding": 0 });

	var mapOptions = { zoom: 17,
					   center: myPos,
					   mapTypeId: google.maps.MapTypeId.ROADMAP,
					   disableDefaultUI: true };
					   
	map = new google.maps.Map(document.getElementById('map-canvas'),
								  mapOptions);
							  
	addMarksForMap( myPos, '目前位罝', 'BOUNCE');	/*add marker for center*/
	
	var tempObj = $.parseJSON(storeListStr);
	
	var counter = 0;
	$.each( tempObj, function(key, value){
		//showObj(1, value );
		if( counter >=20 ){
			return false;
		}
		
		var tempPos = new google.maps.LatLng( value.latitude,
											  value.longitude);
		addMarksForMap( tempPos, value.name, "DROP", value);
		counter++;
	});
}

function subMenuInit(){
	//alert("subMenuInit");
}

function subMenuHandler(e){
	//alert("subMenuHandler = " + $(".mainPage:visible").css("left") );
	var pageLeft = ( $(".mainPage:visible").css("left") ).slice(0, -2);
	if( pageLeft == "0" || pageLeft == 0 ){
		showSubMenu("subBtn");
	}else{
		hideSubMenu("subBtn");
	}
	
	//$("#storeList").prev("form").toggle();
}

function showSubMenu(e){
	//alert("show subMenu =\n" + e);
	//showJson(e);
	subMenuInit();
	//$("#subMenuPage").css({ "left" : "0" });
	//$(".mainPage").css({ "left": "0" });
	$("#subMenuPage").animate({"left":"0"},
								"easeOutExpo" );
	$(".mainPage").animate({"left":"80%"},
								"easeOutExpo" );
						
	//setTimeout(" $('.mainPage').animate({'left':'80%'},	'easeOutExpo' ) ", 500);
}

function hideSubMenu(action){
	//alert("hide subMenu");
	if(action != 0){
		$(".mainPage").animate({"left":"0"},
								"easeOutExpo" );
		$("#subMenuPage").animate({"left":"-80%"},
								"easeOutExpo" );
	}else{
		$(".mainPage").css({ "left": "0" });
		$("#subMenuPage").css({ "left": "-80%" });
	}
		
}

function selectedHandler(e, item){
	alert("getTableItem = " + item + "\n" + e);
	//showJson(e);
}

function changePage(e){
	var column = $(e).parent('li').index();
	var targetPage;
	console.log("changePage = %d", column );
	
	switch(column){
		case 0:{
			targetPage = "#mapPage";
			break;
		}
		
		case 2:{
			targetPage = "#onsalePage";
			break;
		}
		
		case 3:{
			targetPage = "#favoritePage";
			break;
		}
		
		case 4:{
			targetPage = "#historyPage";
			//targetPage = "#mapPage2";
			break;
		}
		
		default:{
			targetPage = "#storeListPage";
			break;
		}
		
	}
	
	/*
	$(".mainPage").css({ "visibility": "hidden" });
	hideSubMenu(1);
	$.mobile.changePage(targetPage, { transition: "slide"} );
	$(".mainPage").css({ "visibility": "visible" });
	*/
	
	console.log("targetPage = %s", targetPage);
	$(".mainPage").css({ "visibility": "hidden" });
	$.mobile.changePage(targetPage, { transition: "none"} );
	$(".mainPage").css({ "visibility": "visible" });
	hideSubMenu(1);
	
}

function getStoreList(){
	//console.log("getStoreList");
	var url = "http://www.walker-plus.com/APIs/wp_APIs.php";
	var tempData = { latitude: myLat,
					 longitude: myLng,
					 distant: 13030000 };
					 
	//showObj(1, tempData);
	
	$.ajax({ type: "POST",
			url: url,
			cache	: false,
			data: tempData,
			crossDomain: true,
			success: function(response){ getDataSuccess(response) },
			error: function(error){ console.log(error) }
			});
}

function getDataSuccess(data){
	storeListStr = data;
	var jsonData = $.parseJSON(data);
    //showObj(1, jsonData);
    console.log("data = %d", countJson(jsonData, "json" ));
    
    var tempLiStr = "";
	var counter = 0;
	$.each( jsonData, function(key, value){
		//console.log("data = %d", key);
		//showObj(1, value);
		//console.log("stringLenght = %d", value.name.lenght );
		if( counter >= 20){
			return false;
		}
		value.Distance = value.Distance.toFixed(1);
        tempLiStr += setListCell(value);
		counter++;
	});
    
    //console.log( tempLiStr );
	$("#storeList").html(tempLiStr);
	$("#storeList").listview("refresh");
    
}

function getStoreId(target){
	//console.log("get the stroeId = %s, historyData = %s", target.id, historyData;
	//console.log("get click data = %s", $(target).parent().index() );
	var writeFlg;
	var historyData;
	
	var selectedData = {
		store_id: target.id,
		name: $(target).find("#list_storeName").html(),
		image: $(target).find("#list_img").attr("src"),
		store_type: $(target).find("#list_storeType").html(),
		addr: $(target).find("#list_addr").html()
		};
		
	//console.log("historyStr = %s", selectedData.name);
	if(historyStr && historyStr != ""){
		writeFlg = historyStr.indexOf( selectedData.name );
		historyData = $.parseJSON(historyStr);
	}
	
	console.log("writeFlg = %s", writeFlg);
	if(!writeFlg || writeFlg == -1){
		historyStr = convertData(historyData, selectedData, 9);
		//console.log("historyStr = %s", historyStr);
		writeToFile("history.txt", historyStr);
	}
}

function convertData(oldData, newData, number){
	//console.log("convertData = %d, %d", number, countJson(oldData, "json") );
	
	var finalData = {};
	var dataNumb ;	
	
	if(number){
		dataNumb = number; /*only keep 10 recod*/
		
		if( countJson(oldData, "json") <= number ){
			dataNumb = countJson(oldData, "json");
		}
	
	}else{
		dataNumb = countJson(oldData, "json"); /*unlimited*/
	}
	
	//console.log("convertData = %d", dataNumb );

	
	for( i = dataNumb; i >= 0; i--){
		if(i != 0){
			finalData[i] = oldData[i-1];
		}else{
			finalData[0] = newData;
		}
		
	}
	
	return JSON.stringify(finalData);
}

function searchHandler(e, target){
	console.log("searchHandler = %s, %s, %s", $(target).val(), target.name );
	//showObj(1, target);
	var inputStr = $(target).val();
	var tableName = target.name;
	
	//console.log("tableName = %s", document.getElementById(tableName).innerHTML );
	//var table =  document.getElementById(tableName);
	
	if(e.keyCode == 13){
		//$(target).blur();
		$(":focus").blur();
	}
	
	if( inputStr.length < 1 ){
		$("#" + tableName + " li").each(function(){ $(this).show(); });
	}else{
		$("#" + tableName + " li").each(function(){ 
											var type = ($(this).find("#list_storeType").html()).toLowerCase();
											var name = ($(this).find("#list_storeName").html()).toLowerCase();
											//console.log( "tempStr = %s, %s, %s",inputStr, name, type )
											//console.log( "name match = %s", name.indexOf(inputStr.toLowerCase()) );
											//console.log( "type match = %s", type.indexOf(inputStr.toLowerCase()) );
											
											if( (name.indexOf(inputStr.toLowerCase() ) == -1) && 
												(type.indexOf(inputStr.toLowerCase() ) == -1) ){											
												$(this).hide(); 
												//console.log("hide===");
											}else{
												$(this).show();
												//console.log("show===");
											}
												
											});
	}
	
}
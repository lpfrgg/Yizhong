// JavaScript Document
var imgNo = 1;
var imgWidth = $(window).width();
var imgHeight = imgWidth /1.5;

function storePageInit(){
	//alert("storePageInit");
	//preventDefault. if not, storeInfo will move when scrool up on scroller1.
	$("#storePage #scroller1").on("swipe", function (e) { e.preventDefault(); }, false);
	$("#storePage #scroller1").on("vmousedown vmousemove vmouseup", function(e){
                                  swiperHandler(e, this); });
	
	$("#storeInfo").on("vmousemove", function(e){ storeInfoSwipeHandler(e, this); });    
	$("#storeInfo").css({ "margin-top": imgHeight });
	
	setupScrollImg();
	setMapImg();
	
}

var orgY, newY, endY, previousAction="vmouseup", detectFlg = 1;
function storeInfoSwipeHandler(e, target){
	var offset = $(target).offset();
	//console.log("storeSwipeHandler. Top = %f, %f", offset.top, $(target).css("top") );
	//showObj(1, e.type);
	
	var tempObj = $("#storePageHeader")
	//console.log("detect %f, %f", offset.top, tempObj.css("opacity") );
	
	if( offset.top <= 90 ){
		//console.log("swipUp = %f", offset.top);
		if( tempObj.css("opacity") != 1 || tempObj.css("opacity") != "1" ){
			tempObj.animate({ opacity: 1 }, 50 );
		}
		
	}else if( offset.top > 100 ){
		//console.log("swipDown = %f", offset.top);
		if( tempObj.css("opacity") != 0 || tempObj.css("opacity") != "0"){
			tempObj.animate({ opacity: 0 }, 50 );
		}
	}
}

var orgX, newX, endX, currentPage, totalPage;
function swiperHandler(e, target){
	//showObj(1, e.swipestart.coords);
    //showObj(1, e.originalEvent.originalEvent.targetTouches);
    var scrollerPos, distant, moveDist
    var triggerObj = $(target);
    //console.log("targetID = %s", target.id);
    
    scrollerPos = triggerObj.position();
    totalPage = triggerObj.width() / $(window).width();
    
	if(e.type == "vmousedown"){
        currentPage = parseInt( Math.abs(scrollerPos.left)/$(window).width() );
		orgX = e.pageX;
        newX = e.pageX;
		endX = e.pageX;
	}else{
		newX = endX;
		endX = e.pageX
	}
	//console.log("orgX = %f, endX = %f",orgX, endX);
    
	distant = newX - endX;
	moveDist = scrollerPos.left - distant;
	
	//console.log("moveDist = %f, scrollerPos = %f, distant = %f",moveDist, scrollerPos.left, distant);
	if( scrollerPos.left >= 0 && distant < 0 ){
		//the first page, can't swiperight
        moveDist = 0;
    }else if( Math.abs(scrollerPos.left) >= ( triggerObj.width()-$(window).width() ) && distant > 0 ){
		//the last page, can't swipe left
    	moveDist = -( triggerObj.width() - $(window).width() );
    }else{
        triggerObj.css({ "left": (moveDist+"px") });
        
		//when touch leave, check PageStatus -- go back or shift one page
        if( e.type == "vmouseup"){
            moveDist = orgX - endX;
			currentPage = shiftIndicator(currentPage, totalPage);
            //console.log( "orgX=%f, endX=%f, currentPage=%d, totalPage=%f, moveDist=%f", orgX, endX, currentPage, totalPage, moveDist );
			
			//shift indicator and page
            document.querySelector("#indicator > li.active").className = "";
            document.querySelector("#indicator > li:nth-child(" + (currentPage+1) + ")").className = 'active';
            moveDist = 0 - ( currentPage * $(window).width() );
            triggerObj.animate({"left": moveDist },
                                   "easeOutExpo" );
        }
    }
	//==========subFunction=============
	function shiftIndicator(page, totalPage){
		var limitedDist = $(window).width()/4;
		if( Math.abs(moveDist) > limitedDist ){
			//distant is long enough to change Page
			//console.log( "orgX=%f, endX=%f, currentPage=%d, totalPage=%f, moveDist=%f", orgX, endX, currentPage, totalPage, moveDist );
			if(orgX > endX && page < totalPage-1){
				//incrise page
				currentPage++;
			}else if(orgX < endX && page > 0){
				//reduce page
				currentPage--;
			}
		}
		return currentPage;
	}/*shiftIndicator*/
	
    
}

function setupScrollImg(data){
	//alert("setupScrollImg = " + data.raw_name);
	
	document.getElementById("thelist").innerHTML = "";
	document.getElementById("indicator").innerHTML = "";
	
	var imgString="";
	var dotString="";
	var imgNumbs = 5;
	contentWidth = imgWidth * imgNumbs;
	
	for( i=1 ; i<=imgNumbs ; i++){
		imgString += "<li><img class=\"storeImg\" src=\"img/Motel_Room0" + (i%5) + ".png\"></li>";
		//alert("check number = " + imgString);
		if(i==1){
			dotString += "<li class=\"active\">1</li>";
		}else{
			dotString += "<li>" + i + "</li>";
		}
	}
	//alert(imgString);
	document.getElementById("thelist").innerHTML = imgString;
	document.getElementById("indicator").innerHTML = dotString;
	
	setupScrollCss();
}

function setupScrollCss(){
	//alert("setupScrollCss = " + contentWidth);
	$("#wrapper1").css({"height":imgHeight});
    $("#scroller1").css({ "width": contentWidth});
    $("#scroller1 ul li .storeImg").css({"width":imgWidth, "height":imgHeight});
	
	var navHeight = imgHeight;
	$("#nav").css({"top": navHeight});
	
}

function setMapImg(){
	var tempSrc;
	var mapImgWidth = $(window).width() * 0.9;
	var mapImgHeight = mapImgWidth /1.5;
	
	tempSrc = "http://maps.googleapis.com/maps/api/staticmap?sensor=false&zoom=15&center=";
	tempSrc += myLat +"," + myLng + "&size=" + mapImgWidth + "x" + mapImgHeight + "&";
	tempSrc += "markers=color:blue%7Clabel:S%7C" + myLat + "," + myLng;
	//alert("tempSrc = " + tempSrc);
	$("#mapImg").attr("src", tempSrc);
}

function favoritedHandler(){
	//console.log("favoritedHandler = %s", favoriteStr );
	var tempName = $("#storePage_storeName").html();
	var tempId = $("#storePage_storeId").html();
	
	if( favoriteStr.indexOf(tempId) == -1 || favoriteStr.indexOf(tempName) == -1){
		var tempData = {};
		
		if(favoriteStr != ""){
			tempData = $.parseJSON(favoriteStr);
		}
		
		var nowTime = new Date();
		var unitTime = nowTime.getTime();
		var tempSaveData = {
			store_id: $("#storePage_storeId").html(),
			name: $("#storePage_storeName").html(),
			image: $("#storePage_storeImg").attr("src"),
			store_type: $("#storePage_storeType").html(),
			addr: $("#storePage_storeAddr").html()
		}
		
		tempData[unitTime] = tempSaveData;
		favoriteStr = JSON.stringify( tempData);
		writeToFile("favorite.txt", favoriteStr);
		alert("已加入收藏清單");
	}else{
		alert("已存在收藏清單");
	}
}
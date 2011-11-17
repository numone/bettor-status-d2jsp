// ==UserScript==
// @name          Bettor Status
// @namespace     d2jsp
// @description   Puts the betting status of the person in their avatar
// @version       3.0.0
// @include       http://forums.d2jsp.org/*
// @require       http://userscripts.org/scripts/source/74204.user.js
// ==/UserScript==
/**************************************
** COPYRIGHT NUMONE@D2jsp.org ******
**************************************/
//globals
var CACHE_TIME = 1000 * 60 * 60; //1000 to convert to seconds, 60 to convert to min, 60 for 60 minutes
var HEADER_URL = 'http://bettor-status-d2jsp.googlecode.com/svn/lists/master.json';
var PAGE_TYPE = window.location.href.match(/\/game\/forum_thread.pl/) ? 'forum_thread'
	: window.location.href.match(/\/topic\.php/) ? 'thread'
	: window.location.href.match(/\/pm\.php/) ? 'pm'
	: window.location.href.match(/\/user\.php/) ? 'user'
	: 'UNKNOWN';
var LIST = {}; // holds the list of everything

function parsePage(){
	alert(JSON.stringify(LIST));
};

function gatherSport(sequence){
	if(sequence + 1 === LIST.sports.length){
		//save to cache
		GM_setValue('BSExpireTime',new Date().getTime() + CACHE_TIME);
		GM_setValue('BSListInfo',JSON.stringify(LIST));
		
		window.setTimeout(function() { parsePage(); },0);
	}
	var sport = LIST.sports[sequence];
	sport.names = {};
	
	GM_xmlhttpRequest({
		method:'GET',
		url:sport.namesURL,
		headers: {
	        'User-agent': 'Mozilla/4.0 (compatible) Greasemonkey',
	        'Accept': 'application/atom+xml,application/xml,text/xml',
	    },
		onload:function(response){
			parseNames(sport.names,response.responseText);
			gatherSport(sequence + 1);
		},
		onerror:function(err){
			showErrorMsg('Error retrieving list ' + sport.title);
		}
	});
};

function parseNames(nameObj,list){
	var userStatus;
	var split = list.split(/\r\n|\r|\n/);
	for(var i=0;i<split.length;i++){
		var temp = split[i];
		if(temp.match(/###[a-zA-Z0-9]+###/)){
			//console.log('Title: ' + temp.replace(/#/g,''));
			userStatus = temp.replace(/#/g,'').trim();
		}else if(temp.length > 0){
			if(temp.match(/[^\s]\s+\/\/[0-9]+/)){
				var temp2 = temp.split(/\s+\/\//);
				//console.log('Name: ' + temp2[0].replace(/\/\//g,'').trim() + ' with number: ' + temp2[1].trim());
				nameObj[temp2[0].replace(/\/\//g,'').trim().toUpperCase()] = {status:userStatus,id:temp2[1].trim()};
			}else{
				//console.log('Name: ' + temp.trim() + ' length: ' + temp.trim().length);
				nameObj[temp.trim().toUpperCase()] = {status:userStatus};
			}
		}else{
			//console.log('seporator');
			// empty line (hopefully)
		}
	}
};

function showErrorMsg(msg){
	var div = document.createElement('DIV');
	$(div).css({
		position:'absolute',
		backgroundColor:'yellow',
		width:'50%',
		padding:'5px',
		top:'95px',
		textAlign:'center',
		left:'25%',
		fontWeight:'bold'
	}).html('Bettor Status Message: ' + msg);
	document.body.appendChild(div);
};

function retrieveCache(){
	var expTime = GM_getValue('BSExpireTime');
	if(!expTime){//first load?
		return false;
	}
	var nowTime = new Date().getTime();
	if(nowTime > expTime){ //we've expired
		return false;
	}
	
	LIST = JSON.parse(GM_getValue('BSListInfo'));
	widow.setTimeout(function(){ parsePage(); },0);
	return true;
};

function retrieveHeader(){
	GM_xmlhttpRequest({
		method:'GET',
		url:HEADER_URL + '?' + (new Date().getTime()),
		headers: {
	        'User-agent': 'Mozilla/4.0 (compatible) Greasemonkey',
	        'Accept': 'application/atom+xml,application/xml,text/xml',
	    },
		onload:function(response){
			alert(response.responseText);
			LIST = JSON.parse(response.responseText);
			gatherSport(0);
		},
		onerror:function(err){
			showErrorMsg('Error retrieving list header');
		}
	});
};


retrieveCache() || retrieveHeader();
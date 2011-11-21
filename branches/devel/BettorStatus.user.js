// ==UserScript==
// @name          Bettor Status
// @namespace     d2jsp
// @description   Puts the betting status of the person in their avatar
// @version       3.00
// @include       http://forums.d2jsp.org/*
// @require       https://ajax.googleapis.com/ajax/libs/jquery/1.7.0/jquery.min.js
// ==/UserScript==
/**************************************
** COPYRIGHT NUMONE@D2jsp.org ******
**************************************/
//globals
var CACHE_TIME = 1000 * 60 * 60; //1000 to convert to seconds, 60 to convert to min, 60 for 60 minutes
var HEADER_URL = 'http://bettor-status-d2jsp.googlecode.com/svn/lists/master.json';
var PAGE_TYPE = window.location.href.match(/\/topic\.php/) ? 'thread'
	: window.location.href.match(/\/pm\.php\?c\=3/) ? 'pm'
	: window.location.href.match(/\/user\.php/) ? 'user'
	: 'UNKNOWN';
var LIST = {}; // holds the list of everything

function showPreferencesMenu(){
	$('BODY').css({'overflow':'hidden'});
	$('BODY').append('<div id="Bettor_Status_bkgrnd" style="position:absolute;top:0%;left:0%;width:100%;height:100%;background-color:black;z-index:1001;-moz-opacity:0.6;opacity:.60;filter:alpha(opacity=60)">' +
		'</div><div id="Bettor_Status_forgrnd" style="position:absolute;top:25%;left:25%;width:50%;height:50%;padding:16px;border:5px solid #8FBEFF;background-color:#E4EBFF;z-index:1002;overflow:auto;"></div>');
	var holder = $('#Bettor_Status_forgrnd');
	$(holder).html('<div style="font-size:12pt;"><span style="font-weight:bold;text-decoration:underline;">Bettor Status Settings:</span><span id="Bettor_Status_close" style="float:right;cursor:pointer;color:blue;text-decoration:underline;">Close</span></div>');
	$('#Bettor_Status_close').click(function(){
		$('#Bettor_Status_bkgrnd').remove();
		$('#Bettor_Status_forgrnd').remove();
		$('BODY').css({'overflow':'auto'});
	});
	
	// display type
	$(holder).append('<span style="font-weight:bold;">Status Display:</span> <input type="radio" name="dispType" value="rolled" />Combined <input type="radio" name="dispType" value="seporated" />Seporated');
	$(holder).find('INPUT[name="dispType"][value="' + GM_getValue('BSDispType','rolled') + '"]').prop('checked',true);
	$(holder).find('INPUT[name="dispType"]').click(function(){
		GM_setValue('BSDispType',$(this).prop('value'));
	});
	
	// use list checkboxes
	$(holder).append('<div style="margin-top:15px;font-weight:bold;">Use Status From The Following Sports:</div>');
	for(var i=0;i<LIST.sports.length;i++){
		$(holder).append('<input type="checkbox" name="useSport" value="' + LIST.sports[i].title + '" /> ' + LIST.sports[i].title + '<br />');
		if(!(GM_getValue('BSHideSpt' + LIST.sports[i].title,false))){
			$(holder).find('INPUT[type="checkbox"][value="' + LIST.sports[i].title + '"]').prop('checked',true);
		}
	}
	$(holder).find('INPUT[type="checkbox"][name="useSport"]').click(function(){
		if($(this).prop('checked')){
			GM_setValue('BSHideSpt' + $(this).prop('value'),false);
		}else{
			GM_setValue('BSHideSpt' + $(this).prop('value'),true);
		}
	});
	
	// names last updated
	var timeAgo = Math.round(((new Date().getTime()) - (GM_getValue('BSExpireTime') - CACHE_TIME)) / 60000);
	if(GM_getValue('BSExpireTime') == '0'){
		$(holder).append('<br /><br /><br /><span id="Bettor_Status_refreshSpan">Names List will reload when the page is refreshed (F5)</span>');
	}else{
		$(holder).append('<br /><br /><br /><span id="Bettor_Status_refreshSpan"><span style="font-style:italic;">Names List Last Updated ' + timeAgo + ' minutes ago.</span> <a href="#" id="Bettor_Status_refresh">Reload Now</a></span>');
		$('#Bettor_Status_refresh').click(function(){
			GM_setValue('BSExpireTime','0');
			$('#Bettor_Status_refreshSpan').html('Will now reload when the page is refreshed (F5)');
		});
	}
};

function showPreferencesLink(){
	$('BODY DIV.bar DIV.barR').append('<a href="#" id="Bettor_Status_pref">Bettor Status Settings</a>');
	$('#Bettor_Status_pref').click(function(){
		showPreferencesMenu();
	});
};

function showStatus(nameList,nameHolders){
	for(var i=0;i<nameList.length;i++){
		var resultsArray = [];
		var results = {rank:-1};
		for(var j=0;j<LIST.sports.length;j++){
			var sport = LIST.sports[j];
			if(!(GM_getValue('BSHideSpt' + sport.title,false))){
				if(sport.names[nameList[i].toUpperCase()]){
					resultsArray.push({sport:sport.title,status:sport.names[nameList[i].toUpperCase()].status});
					if(results.rank < LIST.statusInfo[sport.names[nameList[i].toUpperCase()].status].rank){
						results = {rank:LIST.statusInfo[sport.names[nameList[i].toUpperCase()].status].rank,status:sport.names[nameList[i].toUpperCase()].status};
					}
				}else{
					resultsArray.push({sport:sport.title,status:'unknown'});
					if(results.rank < 0){
						results = {rank:0,status:'unknown'};
					}
				}
			}
		}
		if(results.rank > -1){
			if(GM_getValue('BSDispType','rolled') == 'rolled'){
				$(nameHolders[i]).append('<div>Bettor Status: ' + results.status + '</div>');
			}else{
				var appendStr = '';
				for(var j=0;j<resultsArray.length;j++){
					appendStr += '<div>' + resultsArray[j].sport + ': ' + resultsArray[j].status + '</div>';
				}
				$(nameHolders[i]).append(appendStr);
			}
		}
	}
};

function parsePage(){
	var names = [],nameHolders = [];
	switch(PAGE_TYPE){
		case 'thread':
			$('BODY DIV.tbb FORM[name="REPLIER"] DL DT A[href^="user.php"]').each(function(){
				names.push($(this).text());
			});
			$('BODY DIV.tbb FORM[name="REPLIER"] DL DD TABLE.ftb TBODY TR TD.bc1').each(function(){
				nameHolders.push(this);
			});
			break;
		case 'pm':
			$('BODY FORM[name="a"] TABLE:eq(0) TR TD DL DT A[href^="user.php"]').each(function(){
				names.push($(this).text());
			});
			$('BODY FORM[name="a"] TABLE:eq(0) TR TD DL DD TABLE TD.bc1').each(function(){
				nameHolders.push(this);
			});
			break;
		case 'user':
			$('BODY TABLE TR TD DL DT A[href="#"]').each(function(){
				names.push($(this).text());
			});
			$('BODY TABLE TR TD DL DD UL.bc1').each(function(){
				var list = document.createElement('LI');
				this.appendChild(list);
				nameHolders.push(list);
			});
			break;
	}

	if(names.length > 0 && nameHolders.length > 0){
		showStatus(names,nameHolders);
	}
	showPreferencesLink();
};

function gatherSport(sequence){
	if(sequence + 1 > LIST.sports.length){
		//save to cache
		GM_setValue('BSExpireTime',(new Date().getTime() + CACHE_TIME) + '');
		GM_setValue('BSListInfo',JSON.stringify(LIST));
		
		parsePage();
		//window.setTimeout(function() { parsePage(); },0);
		return;
	}
	LIST.sports[sequence].names = {};
	
	GM_xmlhttpRequest({
		method:'GET',
		url:LIST.sports[sequence].namesURL + '?' + (new Date().getTime()),
		headers: {
	        'User-agent': 'Mozilla/4.0 (compatible) Greasemonkey',
	        'Accept': 'application/atom+xml,application/xml,text/xml',
	    },
		onload:function(response){
			parseNames(sequence,response.responseText);
			gatherSport(sequence + 1);
		},
		onerror:function(err){
			showErrorMsg('Error retrieving list ' + LIST.sports[sequence].title);
		}
	});
};

function parseNames(sequence,responseText){
	var userStatus;
	responseText = responseText.replace(/\r\n|\r|\n/gi,'#EL##SL#');
	var split = responseText.split('#EL##SL#');
	for(var i=0;i<split.length;i++){
		var temp = split[i];
		if(temp.match(/###[a-zA-Z0-9]+###/)){
			//console.log('Title: ' + temp.replace(/#/g,'').trim());
			userStatus = temp.replace(/#/g,'').trim();
		}else if(temp.length > 0){
			if(temp.match(/[^\s]\s+\/\/[0-9]+/)){
				var temp2 = temp.split(/\s+\/\//);
				//console.log('Name: ' + temp2[0].replace(/\/\//g,'').trim() + ' with number: ' + temp2[1].trim());
				LIST.sports[sequence].names[temp2[0].replace(/\/\//g,'').trim().toUpperCase()] = {status:userStatus,id:temp2[1].trim()};
			}else{
				//console.log('Name: ' + temp.trim() + ' length: ' + temp.trim().length);
				LIST.sports[sequence].names[temp.trim().toUpperCase()] = {status:userStatus};
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

function retrieveCache(){//return false;
	var expTime = GM_getValue('BSExpireTime');
	if(!expTime){//first load?
		return false;
	}
	var nowTime = new Date().getTime();
	if(nowTime > expTime){ //we've expired
		return false;
	}
	
	LIST = JSON.parse(GM_getValue('BSListInfo'));
	parsePage();
	//window.setTimeout(function(){ parsePage(); },0);
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
			LIST = JSON.parse(response.responseText);
			gatherSport(0);
		},
		onerror:function(err){
			showErrorMsg('Error retrieving list header');
		}
	});
};


retrieveCache() || retrieveHeader();
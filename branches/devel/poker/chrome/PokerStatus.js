/**************************************
** COPYRIGHT NUMONE@D2jsp.org ******
**************************************/
//globals
var POKERSTATUS = {
	VERSION:1.03,
	CACHE_TIME:1000 * 60 * 60, //1000 to convert to seconds, 60 to convert to min, 60 for 60 minutes
	HEADER_URL: 'http://bettor-status-d2jsp.googlecode.com/svn/lists/masterPoker.json',
	PAGE_TYPE : window.location.href.match(/\/topic\.php/) ? 'thread'
	: window.location.href.match(/\/pm\.php\?c\=3/) ? 'pm'
	: window.location.href.match(/\/user\.php/) ? 'user'
	: window.location.href.match(/\/settings\.php/) ? 'settings'
	: 'UNKNOWN',
	LIST : {} // holds the list of everything
}

// universal fieldset
$('BODY').append('<fieldset style="padding:5px;position:absolute;z-index:100;background-color:#D4E0FF;" id="psFieldset"><legend style="background-color:#D4E0FF;border:1px solid #B0B0B0;"><span></span><img style="vertical-align:inherit;margin-left:2px;cursor:pointer;" src="images/x.gif" /></legend><div class="main"></div></fieldset>');
$('#psFieldset LEGEND IMG').click(function(){$('#psFieldset').hide();});
$('#psFieldset').hide();

// caller is disabled
function showPreferencesMenu(){
	$('BODY').css({'overflow':'hidden'});
	$('BODY').append('<div id="Bettor_Status_bkgrnd" style="position:absolute;top:0%;left:0%;width:100%;height:100%;background-color:black;z-index:1001;-moz-opacity:0.6;opacity:.60;filter:alpha(opacity=60)">' +
		'</div><div id="Bettor_Status_forgrnd" style="position:absolute;top:25%;left:25%;width:50%;height:50%;padding:16px;border:5px solid #8FBEFF;background-color:#E4EBFF;z-index:1002;overflow:auto;color:black;"></div>');
	var holder = $('#Bettor_Status_forgrnd');
	$(holder).html('<div style="font-size:12pt;"><span style="font-weight:bold;text-decoration:underline;">Bettor Status Settings:</span><span id="Bettor_Status_close" style="float:right;cursor:pointer;color:blue;text-decoration:underline;">Close</span></div>');
	$('#Bettor_Status_close').click(function(){
		$('#Bettor_Status_bkgrnd').remove();
		$('#Bettor_Status_forgrnd').remove();
		$('BODY').css({'overflow':'auto'});
	});
	
	// display type
	$(holder).append('<span style="font-weight:bold;">Status Display:</span> <input type="radio" name="dispType" value="rolled" />Combined <input type="radio" name="dispType" value="seporated" />Separated');
	$(holder).find('INPUT[name="dispType"][value="' + (localStorage['BSDispType'] || 'rolled') + '"]').prop('checked',true);
	$(holder).find('INPUT[name="dispType"]').click(function(){
		localStorage['BSDispType'] = $(this).prop('value');
	});
	
	// use list checkboxes
	$(holder).append('<div style="margin-top:15px;font-weight:bold;">Use Status From The Following Sports:</div>');
	for(var i=0;i<POKERSTATUS.LIST.sports.length;i++){
		$(holder).append('<input type="checkbox" name="useSport" value="' + POKERSTATUS.LIST.sports[i].title + '" /> ' + POKERSTATUS.LIST.sports[i].title + '<br />');
		if(localStorage['BSHideSpt' + POKERSTATUS.LIST.sports[i].title] != 'true'){
			$(holder).find('INPUT[type="checkbox"][value="' + POKERSTATUS.LIST.sports[i].title + '"]').prop('checked',true);
		}
	}
	$(holder).find('INPUT[type="checkbox"][name="useSport"]').click(function(){
		if($(this).prop('checked')){
			localStorage['BSHideSpt' + $(this).prop('value')] = false;
		}else{
			localStorage['BSHideSpt' + $(this).prop('value')] = true;
		}
	});
	
	// names last updated
	var timeAgo = Math.round(((new Date().getTime()) - (localStorage['PSExpireTime'] - POKERSTATUS.CACHE_TIME)) / 60000);
	if(localStorage['PSExpireTime'] == '0'){
		$(holder).append('<br /><br /><br /><span id="Bettor_Status_refreshSpan">Names List will reload when the page is refreshed (F5)</span>');
	}else{
		$(holder).append('<br /><br /><br /><span id="Bettor_Status_refreshSpan"><span style="font-style:italic;">Names List Last Updated ' + timeAgo + ' minutes ago.</span> <a href="#" id="Bettor_Status_refresh">Reload Now</a></span>');
		$('#Bettor_Status_refresh').click(function(){
			localStorage['PSExpireTime']  = '0';
			$('#Bettor_Status_refreshSpan').html('Will now reload when the page is refreshed (F5)');
		});
	}
};

// caller is disabled
function showPreferencesLink(){
	//$('BODY DIV.bar DIV.barR').append('<a href="#" id="Bettor_Status_pref">Bettor Status Settings</a>');
	$('BODY TABLE DL DD UL.mL').append('<li><a href="#" id="Bettor_Status_pref">Bettor Status Settings</a></li>');
	$('#Bettor_Status_pref').click(function(){
		showPreferencesMenu();
	});
};

function showStatus(nameList,nameHolders){
	for(var i=0;i<nameList.length;i++){
		var resultsArray = [];
		var results = {rank:-1};
		for(var j=0;j<POKERSTATUS.LIST.sports.length;j++){
			var sport = POKERSTATUS.LIST.sports[j];
			//if(localStorage['BSHideSpt' + sport.title] != 'true'){
				if(sport.names[nameList[i].toUpperCase()]){
					resultsArray.push({sport:sport.title,status:sport.names[nameList[i].toUpperCase()].status,id:j});
					if(results.rank < POKERSTATUS.LIST.statusInfo[sport.names[nameList[i].toUpperCase()].status].rank){
						results = {rank:POKERSTATUS.LIST.statusInfo[sport.names[nameList[i].toUpperCase()].status].rank,status:sport.names[nameList[i].toUpperCase()].status};
					}
				}else{
					resultsArray.push({sport:sport.title,status:'Unknown',id:j});
					if(results.rank < 0){
						results = {rank:0,status:'Unknown'};
					}
				}
			//}
		}
		if(results.rank > -1){
			// if(!localStorage['BSDispType'] || localStorage['BSDispType'] == 'rolled'){
				// function createLink(){
					// $(nameHolders[i]).append('<div class="sportStatusHolder"><a href="javascript:void(0);">Bettor Status</a>: ' + colorTheStatus(results.status) + '</div>');
					// var resArray = resultsArray;
					// $(nameHolders[i]).find('DIV.sportStatusHolder:last A').click(function(){
						// showMultiSportsInfo(resArray,this);
					// });
				// }
				// createLink();
			// }else{
				for(var j=0;j<resultsArray.length;j++){
					function createLinks(idx){
						var appendStr = '<div class="sportStatusHolder"><a href="javascript:void(0);">' + resultsArray[idx].sport + '</a>: ' + colorTheStatus(resultsArray[idx].status) + '</div>';
						$(nameHolders[i]).append(appendStr);
						var theID = resultsArray[idx].id;
						$(nameHolders[i]).find('DIV.sportStatusHolder:last A').click(function(){
							showSingleSportInfo(theID,this);
						});
					}
					createLinks(j);
				}
			//}
		}
	}
};

function showSingleSportInfo(id,link){
	var offset = $(link).offset();
	var sportInfo = POKERSTATUS.LIST.sports[id];
	$('#psFieldset').css({top:offset.top,left:offset.left}).show();
	$('#psFieldset LEGEND SPAN').html(sportInfo.title + ' Info');
	$('#psFieldset DIV.main').html('<a href="' + sportInfo.list + '" target="_blank">Link To ' + sportInfo.title + ' List Image</a><br /><br />List Ran By:<br />');
	for(var i=0;i<sportInfo.listRunner.length;i++){
		$('#psFieldset DIV.main').append('<a href="' + sportInfo.listRunner[i].link + '" target="_blank">'  + sportInfo.listRunner[i].name + '</a><br />');
	}	
};

function showMultiSportsInfo(resultsArray,link){
	var offset = $(link).offset();
	$('#psFieldset').css({top:offset.top,left:offset.left}).show();
	$('#psFieldset LEGEND SPAN').html('Poker Status Info');
	$('#psFieldset DIV.main').html('');
	for(var i=0;i<resultsArray.length;i++){
		var t = resultsArray[i];
		$('#psFieldset DIV.main').append('<div><a title="links to ' + t.sport + ' list" href="' + POKERSTATUS.LIST.sports[t.id].list + '" target="_blank">' + t.sport + '</a>: ' + colorTheStatus(t.status) + ' <span style="font-size:7pt;">Ran By: </span></div>');
		for(var j=0;j<POKERSTATUS.LIST.sports[t.id].listRunner.length;j++){
			var o = POKERSTATUS.LIST.sports[t.id].listRunner[j];
			$('#psFieldset DIV.main DIV:last SPAN:last').append(' <a href="' + o.link + '" target="_blank">' + o.name + '</a>');
		}
	}
};

function colorTheStatus(status){
	if(POKERSTATUS.LIST.statusInfo[status]){
		return '<span style="color:' + POKERSTATUS.LIST.statusInfo[status].color + ';font-weight:bold;">' + status + '</span>';
	}else{
		return '<span style="color:gray;font-weight:bold;">' + status + '</span>';
	}
};

function showMedList(){
	var forumID = parseInt(window.location.href.split('&f=')[1]);
	var theSport = false;
	for(var i=0;i<POKERSTATUS.LIST.sports.length;i++){
		if(POKERSTATUS.LIST.sports[i].medForumIDs){
			var medList = POKERSTATUS.LIST.sports[i].medForumIDs;
			for(var j=0;j<medList.length;j++){
				if(medList[j] == forumID){
					theSport = POKERSTATUS.LIST.sports[i];
					break;
				}
			}
		}
	}
	
	if(!theSport || theSport.medList.length == 0){
		return;
	}
	
	$('BODY DIV.tbb DIV.links B').append('<a id="PSMedListLink" href="javascript:void(0);">Poker Med List</a>');
	$('#PSMedListLink').click(function(){
		showMediators(theSport,this);
	});
};

function showMediators(sportObj,link){
	var offset = $(link).offset();
	$('#psFieldset').css({top:offset.top,left:offset.left}).show();
	$('#psFieldset LEGEND SPAN').html('Poker Med List');
	$('#psFieldset DIV.main').html('');
	for(var i=0;i<sportObj.medList.length;i++){
		if(sportObj.medList[i].id){
			$('#psFieldset DIV.main').append('<span style="font-weight:bold;">' + sportObj.medList[i].name + '</span> ( <a href="http://forums.d2jsp.org/user.php?i=' + sportObj.medList[i].id + '" target="_blank">http://forums.d2jsp.org/user.php?i=' + sportObj.medList[i].id + '</a> )<br />');
		}else{
			$('#psFieldset DIV.main').append('<span style="font-weight:bold;">' + sportObj.medList[i].name + '</span><br />');
		}
	}
};

function parsePage(){
	var names = [],nameHolders = [];
	switch(POKERSTATUS.PAGE_TYPE){
		case 'thread':
			$('BODY DIV.tbb FORM[name="REPLIER"] DL').has('TABLE.ftb').find('DT A[href^="user.php"]').each(function(){
				names.push($(this).text());
			});
			console.log(names);
			$('BODY DIV.tbb FORM[name="REPLIER"] DL DD TABLE.ftb TBODY TR TD.bc1').each(function(){
				nameHolders.push(this);
			});
			console.log(nameHolders.length);
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
		case 'settings':
			//showPreferencesLink();
			break;
	}

	if(names.length > 0 && nameHolders.length > 0){
		showStatus(names,nameHolders);
	}
	
	if(POKERSTATUS.PAGE_TYPE == 'thread'){
		showMedList();
	}
	
	showFlushLink();
};

function showFlushLink(){
	var timeAgo = Math.round(((new Date().getTime()) - (localStorage['PSExpireTime'] - POKERSTATUS.CACHE_TIME)) / 60000);
	$('BODY DIV.crt.links').append(' | Poker Status version: ' + POKERSTATUS.VERSION.toFixed(2) + ', <span id="PSBottomSpan">cached for ' + timeAgo + ' minutes <a href="javascript:void(0);" id="PSBottomFlush">flush</a></span>');
	$('#PSBottomFlush').click(function(){
		localStorage['PSExpireTime']  = '0';
		$('#PSBottomSpan').html('Will now reload when the page is refreshed (F5)');
	});
};

function gatherSport(sequence){
	if(sequence + 1 > POKERSTATUS.LIST.sports.length){
		//save to cache
		localStorage['PSExpireTime'] = (new Date().getTime() + POKERSTATUS.CACHE_TIME) + '';
		localStorage['PSListInfo'] = JSON.stringify(POKERSTATUS.LIST);
		
		parsePage();
		return;
	}
	POKERSTATUS.LIST.sports[sequence].names = {};
	POKERSTATUS.LIST.sports[sequence].medList = [];
	
	chrome.extension.sendRequest({url:POKERSTATUS.LIST.sports[sequence].namesURL + '?' + (new Date().getTime())},function(response){
		if(!response){
			showErrorMsg('Error retrieving list ' + POKERSTATUS.LIST.sports[sequence].title);
			return;
		}
		
		parseNames(sequence,response);
		gatherSport(sequence + 1);
	});
};

function parseNames(sequence,responseText){
	var userStatus;
	responseText = responseText.replace(/\r\n|\r|\n/gi,'#EL##SL#');
	var split = responseText.split('#EL##SL#');
	for(var i=0;i<split.length;i++){
		var temp = split[i];
		if(temp.match(/###[a-zA-Z0-9\s]+###/)){
			//console.log('Title: ' + temp.replace(/#/g,'').trim());
			userStatus = temp.replace(/#/g,'').trim();
		}else if(temp.length > 0){
			if(temp.match(/[^\s]\s+\/\/[0-9]+/)){
				var temp2 = temp.split(/\s+\/\//);
				//console.log('Name: ' + temp2[0].replace(/\/\//g,'').trim() + ' with number: ' + temp2[1].trim());
				POKERSTATUS.LIST.sports[sequence].names[temp2[0].replace(/\/\//g,'').trim().toUpperCase()] = {status:userStatus,id:temp2[1].trim()};
				if(userStatus == 'Mediator'){
					POKERSTATUS.LIST.sports[sequence].medList.push({name: temp2[0].replace(/\/\//g,'').trim(), id: temp2[1].trim()});
				}
			}else{
				//console.log('Name: ' + temp.trim() + ' length: ' + temp.trim().length);
				POKERSTATUS.LIST.sports[sequence].names[temp.trim().toUpperCase()] = {status:userStatus};
				if(userStatus == 'Mediator'){
					POKERSTATUS.LIST.sports[sequence].medList.push({name: temp.trim()});
				}
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
	}).html('Poker Status Message: ' + msg);
	document.body.appendChild(div);
};

function retrieveCache(){//return false;
	var expTime = localStorage['PSExpireTime'];
	if(!expTime){//first load?
		return false;
	}
	var nowTime = new Date().getTime();
	if(nowTime > expTime){ //we've expired
		return false;
	}
	
	POKERSTATUS.LIST = JSON.parse(localStorage['PSListInfo']);
	parsePage();
	return true;
};

function retrieveHeader(){
	chrome.extension.sendRequest({url:POKERSTATUS.HEADER_URL + '?' + (new Date().getTime())},function(response){
		if(!response){
			showErrorMsg('Error retrieving list header. Will used cached lists if available.');
			if(localStorage['PSListInfo']){// we have old lists, we will use that for now
				POKERSTATUS.LIST = JSON.parse(localStorage['PSListInfo']);
				parsePage();
			}
			return;
		}
		POKERSTATUS.LIST = JSON.parse(response);
		gatherSport(0);
	});
};


retrieveCache() || retrieveHeader();
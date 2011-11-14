var NAMES = {};
var namesHolder = {};
var fieldset;

function getElementsByClassName(classname, par){
   var a=[];
   var re = new RegExp('\\b' + classname + '\\b');
   var els = par.getElementsByTagName("*");
   for(var i=0,j=els.length; i<j; i++){
      if(re.test(els[i].className)){
         a.push(els[i]);
      }
   }
   return a;
};

function BettorStatus(){
	getNames();
};

createHTML = function(div,user){
	if(!namesHolder[user]){
		gatherBettorStatus(user);
	}
	
	var br = document.createElement('BR');
	var bold = document.createElement('B');
	var link = document.createElement('A');
	link.href = 'javascript:void(0);';
	link.addEventListener('click',function() { showDetails(user,this); },false);
	var font = document.createElement('FONT');
	font.setAttribute('color',namesHolder[user].activeStatus.color);
	var beginText = document.createElement('textNode');
	beginText.innerHTML = 'Bettor Status: ';
	font.innerHTML = namesHolder[user].activeStatus.status;
	
	link.appendChild(beginText);
	link.appendChild(font);
	bold.appendChild(link);
	var beforeEle = div.getElementsByTagName('DIV')[0];
	div.insertBefore(bold,beforeEle);
	div.insertBefore(br,beforeEle);
};

showDetails = function(user,link){
	openMobileWindow(link);
	populateFieldset(user);
};

populateFieldset = function(user){
	var obj = namesHolder[user];

	// bold tag
	var bold = document.createElement('B');
	fieldset.appendChild(bold);
	
	// each sport
	for(sport in NAMES){
		var curr = NAMES[sport];
		
		if(!(curr['title'])){
			continue;
		}
		
		// a tag and attributes
		var a = document.createElement('A');
		a.href = curr.list;
		a.setAttribute('target','_blank');
		a.innerHTML = curr.title + ' Status:';
		a.setAttribute('title','Links to ' + curr.title + ' list');
		bold.appendChild(a);
		
		var font = document.createElement('FONT');
		if(obj[curr.title]){
			font.setAttribute('color',obj[curr.title].color);
			font.innerHTML = ' ' + obj[curr.title].status;
		}else{
			font.setAttribute('color','gray');
			font.innerHTML = ' Unknown';
		}
		bold.appendChild(font);
		
		var span = document.createElement('SPAN');
		var text = ' Run By:';
		var temp = curr.listRunner;
		for(var i=0;i<temp.length;i++){
			text += ' <a href="' + temp[i].link + '" target="_blank">' + temp[i].name + '</a>';
		}
		span.innerHTML = text;
		span.style.fontSize = '7pt';
		bold.appendChild(span);
		
		var br = document.createElement('BR');
		bold.appendChild(br);
	}
};

openMobileWindow = function(link){
	var offsetTop = getOffset(link).top;
	if(fieldset){
		removeDetails();
	}
	
	// field set and properties
	fieldset = document.createElement('FIELDSET');
	fieldset.style.padding = '5px';
	fieldset.style.position = 'absolute';
	fieldset.style.top = offsetTop;
	fieldset.style.left = '50px';
	fieldset.style.zIndex = '100';
	
	// legend and properties
	var legend = document.createElement('LEGEND');
	var legText = document.createElement('TEXTNODE');
	legText.innerHTML = 'Bettor Status Info.&nbsp;';
	var close = document.createElement('A');
	close.href = 'javascript:void(0)';
	close.innerHTML = '<img src="images/x.gif"/>';
	close.addEventListener('click',function() { removeDetails(); },false);
	legend.appendChild(legText);
	legend.appendChild(close);
	fieldset.appendChild(legend);
	
	// append field set
	document.body.appendChild(fieldset);
};

removeDetails = function(){
	fieldset.parentNode.removeChild(fieldset);
	fieldset = null;
};

getOffset = function(elm){
	var offLeft = 0;
	var offTop = 0;
	while(elm){
		offTop += elm.offsetTop;
		offLeft += elm.offsetLeft;
		elm = elm.offsetParent;
	}
	return {top:offTop,left:offLeft};
};

checkSport = function(curSport,user){
	// for each bettor status in the sport
	for(theStatus in curSport.status){
		var curStatus = curSport.status[theStatus];
		for(var i=0;i<curStatus.names.length;i++){
			var curName = curStatus.names[i];
			if(typeof(curName) == 'object'){
				curName = curName.username;
			}
			if(user == curName.toUpperCase()){
				var theUser = namesHolder[user];
				theUser[curSport.title] = {};
				theUser[curSport.title].status = curStatus.title;
				theUser[curSport.title].rank = curStatus.rank;
				theUser[curSport.title].color = curStatus.color;
				return;
			}
		}
	}
};

gatherBettorStatus = function(user){
	namesHolder[user] = {};
	// for each sport
	for(sport in NAMES){
		var curSport = NAMES[sport];
		if(curSport['title']){
			checkSport(curSport,user);
		}
	}
	
	resolveStatus(user);
};

// figures out the current status of the user based on rank
resolveStatus = function(user){
	var curLeader = {rank:-1};
	for(sport in namesHolder[user]){
		var userBracket = namesHolder[user];
		var curSport = userBracket[sport];
		if(curSport.rank > curLeader.rank){
			curLeader = curSport;
		}
	}
	
	if(curLeader.rank == -1){
		curLeader.status = 'Unknown';
		curLeader.color = 'gray';
	}
	namesHolder[user].activeStatus = curLeader;
};

doThePage = function(){
	var divs = getElementsByClassName('bc1',document);
	var names = document.getElementsByTagName('DT');
	var name,str,nameOffset,divOffset;
	nameOffset = 0;
	divOffset = 0;
	for(var i=0;i<divs.length;i++){
		// because polls use the tag name ledgend we need to skip them so use an offset parameter.
		if(names[i + nameOffset].innerHTML == 'User Poll'){
			nameOffset++;
		}
		
		// for pm's - they get too many "ledgend" fields - we only want/need the second one
		if(window.location.href.indexOf('pm.php?') > 0){
			nameOffset = 2;
			divOffset = divs.length - 1;
		}
		
		// for replies
		if(window.location.href.indexOf('index.php?act=Post&c') > 0){
			nameOffset = 1;
		}
		
		// apply the offset and grab the element the name is in
		str = names[i + nameOffset].firstChild;

		// if they have an orb, there is another first child
		if(str.innerHTML.indexOf('<') == 0){
			str = str.firstChild;
		}
		
		str = str.innerHTML;
		
		// strip out any images
		var idx = str.indexOf('<');
		if(idx != -1){
			name = str.substring(0,idx)
		}else{
			name = str;
		}
		
		name = name.replace(/ /gi,'');
		
		this.createHTML(divs[i + divOffset],name.toUpperCase());
		
		// for pm's - we only need to run it once, all the other fields are useless
		// same for user profiles
		if(window.location.href.indexOf('pm.php?') > 0 || window.location.href.indexOf('user.php?i') > 0){
			break;
		}
	}
	
	showMedListLink();
};

showMedListLink = function(){
	var forumID = parseInt(window.location.href.split('&f=')[1]);
	var namesObj;
	for(var Sport in NAMES){
		var curSport = NAMES[Sport];
		if(typeof(curSport) == 'object' && 'status' in curSport){
			for(var theStatus in curSport.status){
				var curStatus = curSport.status[theStatus];
				if('medForumId' in curStatus){
					for(var i=0;i<curStatus.medForumId.length;i++){
						if(forumID == curStatus.medForumId[i]){
							namesObj = curStatus;
							break;
						}
					}
				}
			}
		}
	}
	
	if(namesObj){
		var ele = getElementsByClassName('tbb',document);
		if(ele.length > 0){
			var link = document.createElement('A');
			link.href = 'javascript:void(0);';
			link.innerHTML = 'Bettor Med List';
			ele[0].getElementsByTagName('DIV')[0].getElementsByTagName('B')[0].appendChild(link);
			link.addEventListener('click',function() { showMedList(namesObj,link); },false);
		}
	}
}

showMedList = function(namesObj,link){
	openMedList(link);
	populateMedList(namesObj);
};

populateMedList = function(namesObj){
	for(var i=0;i<namesObj.names.length;i++){
		var curName = namesObj.names[i];
		var div = document.createElement('DIV');
		var span = document.createElement('SPAN');
		span.innerHTML = curName.username;
		span.style.fontWeight = 'bold';
		var span2 = document.createElement('SPAN2');
		span2.innerHTML = ' ( ';
		var span3 = document.createElement('SPAN3');
		span3.innerHTML = ' )';
		var link = document.createElement('A');
		link.href = curName.url;
		link.setAttribute('target','_blank');
		link.innerHTML = curName.url;
		div.appendChild(span);
		div.appendChild(span2);
		div.appendChild(link);
		div.appendChild(span3);
		fieldset.appendChild(div);
	}
};

openMedList = function(link){
	var theOffset = this.getOffset(link);
	if(fieldset){
		removeDetails();
	}
	
	// field set and properties
	fieldset = document.createElement('FIELDSET');
	fieldset.style.padding = '5px';
	fieldset.style.position = 'absolute';
	fieldset.style.top = theOffset.top + 10 + 'px';
	fieldset.style.left = theOffset.left + 10 + 'px';
	fieldset.style.zIndex = '100';
	
	// legend and properties
	var legend = document.createElement('LEGEND');
	var legText = document.createElement('TEXTNODE');
	legText.innerHTML = 'Bettor Med List&nbsp;';
	var close = document.createElement('A');
	close.href = 'javascript:void(0)';
	close.innerHTML = '<img src="images/x.gif"/>';
	close.addEventListener('click',function() { removeDetails(); },false);
	legend.appendChild(legText);
	legend.appendChild(close);
	fieldset.appendChild(legend);
	
	// append field set
	document.body.appendChild(fieldset);
};

showErrorMsg = function(msg){
	var div = document.createElement('DIV');
	div.style.position = 'absolute';
	div.style.backgroundColor = 'yellow';
	div.innerHTML = 'Bettor Status Message: ' + msg;
	div.style.width = '50%';
	div.style.padding = '5px';
	div.style.top = '95px';
	div.style.textAlign = 'center';
	div.style.left = '25%';
	div.style.fontWeight = 'bold';
	document.body.appendChild(div);
};

getNames = function(){
	chrome.extension.sendRequest(null,requestCallback);	
};

requestCallback = function(data){
	if(!data){
		showErrorMsg('Error retrieving names from angelfire');
	}
	var names = data.substring(data.indexOf('StArToFmYBETTORlIsT') + 19,data.indexOf('EnDoFmYBETTORlIsT'));
	eval(names);
	doThePage();
};

window.setTimeout(function() { BettorStatus(); },0);
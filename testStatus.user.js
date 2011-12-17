// ==UserScript==	
// @name           numone test Status
// @namespace      D2jsp
// @include        http://forums.d2jsp.org/*
// ==/UserScript==

function getNames(){
	GM_xmlhttpRequest(
	{
	    method: 'GET',
	    url: 'http://bettor-status-d2jsp.googlecode.com/svn/lists/test.txt',
	    headers: 
		{
	        'User-agent': 'Mozilla/4.0 (compatible) Greasemonkey',
	        'Accept': 'application/atom+xml,application/xml,text/xml',
	    },
	    onload: function(response)
		{
			var str = response.responseText;
			console.log(str);
			str = str.replace(/\r\n|\r|\n/gi,'#EL##SL#');
			console.log(str);
			var split = str.split('#EL##SL#');
			for(var i=0;i<split.length;i++){
				var temp = split[i];
				if(temp.match(/###[a-zA-Z0-9]+###/)){
					console.log('Title: ' + temp.replace(/#/g,''));
				}else if(temp.length > 0){
					if(temp.match(/[^\s]\s+\/\/[0-9]+/)){
						var temp2 = temp.split(/\s+\/\//);
						console.log('Name: ' + temp2[0].replace(/\/\//g,'').trim() + ' with number: ' + temp2[1].trim());
					}else{
						console.log('Name: ' + temp.trim() + ' length: ' + temp.trim().length);
					}
				}else{
					console.log('seporator');
				}
			}
		}
	});

};

getNames();
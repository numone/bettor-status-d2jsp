function onRequest(request,sender,callback) {
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function(data) {
		if (xhr.readyState == 4) {
			if (xhr.status == 200) {
				var data = xhr.responseText;
				callback(data);
			} else {
				callback(false);
			}
		}
	}
	xhr.open('GET', request.url, true);
	xhr.send();
};

chrome.extension.onRequest.addListener(onRequest);
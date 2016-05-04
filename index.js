var http = require('http'), fs = require('fs'), urlparse = require('url');

http.createServer(function (req,res) {
	var url = urlparse.parse(req.url);

	//res.setHeader("Cache-Control", "public, max-age=" + 1000 * 3600 * 24)
   	res.writeHead(200);

	if (url.pathname == "/get"){
		var corsURL = url.query.replace("url=","");
		corsURL =  urlparse.parse(corsURL);

		
		require(corsURL.protocol.slice(0,-1)).request({
		    host: corsURL.host,
		    path: corsURL.path,
			method: 'GET',
		    headers: {
			    'REFERER': corsURL.host,
				'user-agent': req.headers['user-agent']
			  }
		}, function(response) {
			var html = '';
		    
		    response.on('data', function(chunk) {
		          html += chunk;
		    });
		    response.on('end', function() {
		    	//spoof the base-url for relative paths on the target page
				html = (html||"").replace("<head>", "<head><base href='" + corsURL.protocol + "//" + corsURL.host + "/'>")
				  	
			    res.write(html);
				res.end();
		    });
		}).on('error', (e) => {
		  console.log(e.message);
		}).end();



	} else if ( url.pathname == "/favicon.ico"){
		res.end();

	} else {
		fs.createReadStream("index.html").pipe(res, {end: true});;

		console.log("Connection: "+req.connection.remoteAddress + " " + req.headers['user-agent'].match(/\([^)]+\)/gi)[0].toString() )


	}


}).listen(80, function(){
	console.log("SERVER STARTED " + new Date().toLocaleString());
})
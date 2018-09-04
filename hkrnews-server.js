var http = require('http'), fs = require('fs'), urlparse = require('url');

var app = function (req,res) {
	var url = urlparse.parse(req.url);




	if (url.pathname == "/get"){
		
		var corsURL = url.query && url.query.replace("url=","");
		
		if(!corsURL)
			return res.end();

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
				html = (html||"").replace(/<head[^>]*>/i, "<head><base href='" + corsURL.protocol + "//" + corsURL.host + "/'>")


					delete response.headers['x-frame-options'];
					delete response.headers['content-security-policy'];



					res.writeHead(200, response.headers )

				// 	{
				// 			//"Cache-Control": "public, max-age=" +  1000 * 3600,
				// 		"Content-Type": "text/html",
				// 		// "Content-Encoding": "gzip",
				// 			"Access-Control-Allow-Origin": "*"  //enable external domains to scrape hkrnews.com
				//  });

			   	res.write(html);
					res.end();
		    });
		}).on('error', function(e) {
		  console.log(e.message);
		}).end();



	} else if ( url.pathname == "/favicon.ico"){
		res.end();

	} else {
		res.writeHead(200,{
			"Access-Control-Allow-Origin": "*"  //enable external domains to scrape hkrnews.com
	 });



	 file_path = url.pathname.length < 3 ? "hkrnews-interface.html" : "./"+url.pathname.substr(1);

	 if (fs.existsSync(file_path) )

		 fs.createReadStream(file_path).pipe(res, {end: true});
	 else
		 res.end();



		// console.log("Connection: "+req.connection.remoteAddress + " " + req.headers['user-agent'] + new Date().toLocaleString())


	}


}


http.createServer(app).listen(1337, function(){
	console.log("SERVER STARTED " + new Date().toLocaleString());
})

var http = require('http'), fs = require('fs'), urlparse = require('url');

var app = function (req,res) {
	var url = urlparse.parse(req.url);

   	res.writeHead(200,{
   		"Cache-Control": "public, max-age=" +  1000 * 3600, 
   		"Access-Control-Allow-Origin": "*"  //enable external domains to scrape hkrnews.com
   });



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
				html = (html||"").replace(/<head[^>]*>/i, "<head><base href='" + corsURL.protocol + "//" + corsURL.host + "/'>")
				  	
			    res.write(html);
				res.end();
		    });
		}).on('error', function(e) {
		  console.log(e.message);
		}).end();



	} else if ( url.pathname == "/favicon.ico"){
		res.end();

	} else {
		fs.createReadStream("hkrnews-interface.html").pipe(res, {end: true});;

		console.log("Connection: "+req.connection.remoteAddress + " " + req.headers['user-agent'] + new Date().toLocaleString())


	}


}


http.createServer(app).listen(80, function(){
	console.log("SERVER STARTED " + new Date().toLocaleString());
})



//https 
require('https').createServer({
    cert: fs.readFileSync('../letsencrypt/live/hkrnews.com/fullchain.pem'),
      key: fs.readFileSync('../letsencrypt/live/hkrnews.com/privkey.pem')
  },app).listen(443)

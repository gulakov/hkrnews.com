var express = require('express'),
app = express(),
server = require('http').createServer(app);

//routes
app.get('/',  function(req, res) {

	console.log("Connection: "+req.ip + " " + req.headers['user-agent'].match(/\([^)]+\)/gi)[0].toString() );
    return res.sendFile(__dirname +"/public/index.html")
});

app.get('/get', function(req,res){

 require('bypasscors')(req.query.url, function(html){
	    return res.send(html);
    });

});

//load public files after index.html
app.use(express.static(__dirname + '/public'));

//errors
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.send(err.stack);
});


//run server
server.listen(80);
console.log("SERVER STARTED " + (new Date().toLocaleString()));

//google analytics
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
	(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
	m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
	})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
	ga('create', 'UA-45764194-2', 'hkrnews.com'); ga('send', 'pageview');


var pageCount=4, loadSuccess, loadTime;

$(document).ready(function() {

	$("body").html('<div id="link-panel"></div>	<div id="comments-panel"></div><div id="story-panel">'+
		'<iframe id="article" border="0" frameborder="0"></iframe></div>');


	//mobile
	$('#article').on('load', function () {
	 	var dif = (new Date()).getTime() - loadTime;
	 	console.log("Loaded in "+dif);
	 	if (dif < 300){
	 		var id = document.getElementsByClassName("cur")[0].getElementsByTagName("a")[1].id;

	 		console.log("loading "+id)
        	$('#article').attr("src", '/get?url='+id); 
	 	}
    });


    $('#article').on('error', function () {
	 	alert()
    });


	
	
	loadIndex("");

	//initial
	setTimeout(function(){
		next();

	}, 2000);
	if( navigator.userAgent.match(/(Android|iPhone|iPad)/i)){
	 	$("body").addClass("mobile");
 	}
	

});

function next(){
	if ($(".cur").length)
		var nextLink = $(".cur").next();	
	else 
		var nextLink = $(".link-div:first");

	story(nextLink.find(".link-a").attr("id"), nextLink.find(".cm").attr("id"));
	nextLink.addClass('cur'); 
	$(".cur")[0].scrollIntoViewIfNeeded()
}

function loadIndex(nextPageURL){

	$.get('/get?url=https://news.ycombinator.com/'+nextPageURL, function(data){
		
		if (data.replace(/[\r\n]/g, ' ').match(/<body.*>(.*)<\/body>/gi)==null)
			return;

		var doc = (new DOMParser()).parseFromString(data.replace(/[\r\n]/g, ' ')
			.match(/<body.*>(.*)<\/body>/)[0].replace(/\\/gi,'').replace(/<body>/,"").replace(/<\/body>/,""), "text/html");

		//console.log(doc.getElementsByTagName("body")[0].innerHTML);

		var links = doc.getElementsByClassName("title");
		var sub = doc.getElementsByClassName("subtext");
		var s =0;

		for (var i=0;i<links.length;i++){

			var a = links[i].getElementsByTagName("a");
			if (a) a= a[0];

			if (a && a.innerHTML=="More"){
				pageCount--;
				if(pageCount>0)
					loadIndex(a.outerHTML.match(/href="(.*)"/)[0].replace(/href="/,"")
					.replace(/\//,"").replace(/"/,"").replace(/ rel=\"nofollow\"/,"").toString());

			}else if (a){
				var com; var points;


				try{
					cmCount =parseInt(sub[s].getElementsByTagName("a")[1].innerHTML);
					if (!cmCount)
						cmCount=0;
					points =  parseInt(sub[s].getElementsByTagName("span")[0].innerHTML);

					cmLink = "https://news.ycombinator.com/"+sub[s].getElementsByTagName("a")[1].outerHTML.match(/href="[^>]+"/)[0]
					.replace(/href="/,"").replace(/"/,"");
				}catch(e){} 

				var storyName = a.textContent
					.replace(new RegExp(String.fromCharCode(226) + String.fromCharCode(8364) + String.fromCharCode(8220), 'g'),"-")
					.replace(new RegExp(String.fromCharCode(226) + String.fromCharCode(8364) + String.fromCharCode(8482), 'g'),"'")
					.replace(new RegExp(String.fromCharCode(226) + String.fromCharCode(8364) + String.fromCharCode(339), 'g'),"\"")
					.replace(new RegExp(String.fromCharCode(226) + String.fromCharCode(8364) +"*", 'g'),"");

				var linkUrl = a.href && a.href.length > 2 ? a.href :  cmLink;
				var linkDiv = $("<div class='link-div' style='line-height:1"+(12+Math.min(Math.ceil(points/30),13))+"%; font-size:"+(12+Math.min(Math.ceil(points/20),13))+"px'>");
				var commentsElem = $("<a class='cm' id='"+cmLink+"'>"+cmCount+"</a> ");
				var storyElem = $(" <a class='link-a' href='#' id='"+linkUrl+"' >"+ storyName	+"</a>");

				commentsElem.appendTo(linkDiv);
				$("<span> </span>").appendTo(linkDiv);
				storyElem.appendTo(linkDiv);
				linkDiv.appendTo("#link-panel")

				linkDiv.mousedown(function(e){
					
					if(e.which==1)
						story($(this).find(".link-a")[0].id, $(this).find(".cm")[0].id);
					else
						window.open($(this).find(".link-a")[0].id);
					
					this.className="cur"; 
				});


				s++;
			}

		}
	});
}


function story(storyURL, commentsURL){

	if ($(".cur").length>0)
		$(".cur").attr("class","")
	
	loadTime = (new Date()).getTime();
	$('#article').attr("src", "about:blank");	
	$("#comments-panel").html("");

	$('#article').attr("src", '/get?url='+storyURL);

	$("#comments-panel")[0].scrollTop=0;

	$.get('/get?url='+encodeURIComponent(commentsURL), function(data){
		
		if (data.replace(/[\r\n]/g, ' ').match(/<body.*>(.*)<\/body>/)==null)
			return;


		var commentsHTML = data.replace(/[\r\n]/g, ' ').match(/<body.*>(.*)<\/body>/)[0]
			.replace(/<body>/,"").replace(/<\/body>/,"")
			.replace(/s.gif/gi,"/css/s.gif").replace(/y18.gif/gi,"/css/y18.gif")
			.replace(new RegExp(String.fromCharCode(226) + String.fromCharCode(8364) + String.fromCharCode(8220), 'g'),"-")
			.replace(new RegExp(String.fromCharCode(226) + String.fromCharCode(8364) + String.fromCharCode(8482), 'g'),"'")
			.replace(new RegExp(String.fromCharCode(226) + String.fromCharCode(8364) + String.fromCharCode(339), 'g'),"\"")
			.replace(new RegExp(String.fromCharCode(226) + String.fromCharCode(8364) +"*", 'g'),"");


		var commentsDOM = (new DOMParser()).parseFromString(commentsHTML, "text/html");
		var skip, priorWasTop;
			$(commentsDOM).find("tr td table tbody tr").each(function(){
				skip=!skip;
				if(!skip){
				var level = Math.floor($(this).find("td img").attr("width")/3);
				if(level>0)
					cmClass="comment-sub";
				else
					cmClass="comment-top";

				var commentText='';
				$(this).find(".comment span").each(function(){
					if($(this).text()!='reply')
						commentText += $(this).html();
				})

				commentText=commentText.replace(/reply/g,'');
				//commentText = commentText.html();

				if(commentText.length>2){
					var userName = $(this).find("span a").first().text();
					var toggle = "";
					
					if(level && priorWasTop){
						priorWasTop=false;
						toggle = "<a href='#' onclick='toggleComments(this);' class='minus'>"+
							"<span class='minus-img glyphicon glyphicon-minus-sign'></span>"+
							"<span class='plus-img glyphicon glyphicon-plus-sign'></span></a> ";
					}
					if (!level)
						priorWasTop=true;
					$(toggle+"<div class='"+cmClass+"' style='margin-left:"+level+"px'>"+"<b>"+userName+":</b> "+commentText+"</div>").appendTo("#comments-panel");
				}
				}
			})

			$("#comments-panel").prepend(
				$("<button class='btn btn-default'><a href='"+
					commentsURL+"' target='_blank'>reply</a></button><br/>"));
		
	});
}

function toggleComments(e){
	
	if (e.className=="minus"){

		var hideOn;
		var somethingWasHidden;
		$("#comments-panel div").each(function(){
			if($(this).attr("class")=="comment-top")
				hideOn = false;
			if(hideOn){
				somethingWasHidden=true;
				$(this).hide("fold", {direction: "up"});
			}
			if(this.textContent==$(e).prev().text())
				hideOn = true;
		});

		if(somethingWasHidden)
			e.className="plus";

	} else{
		e.className="minus";
		var showOn;
		$("#comments-panel div").each(function(){
			if($(this).attr("class")=="comment-top")
				showOn = false;
			if(showOn)
				$(this).show("fold", {direction: "down"});
			if(this.textContent==$(e).prev().text())
				showOn = true;
		});

	}

}

window.onkeyup = function(e){
	var key = e.keyCode;

	if ( key == 39||key == 40){
		next();
	}

	if ( key == 37||key == 38){
		if ($(".cur").length){
		var n = $(".cur").prev();
		if (n)
		n.children(1).click();
		}
	}
}

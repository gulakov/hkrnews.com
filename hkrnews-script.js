

var pageCount = 5;

$(document).ready(function() {

	

	loadIndex();

	$("#index").on("mousedown", ".link-div", loadArticle)

	$("#comments").on("click", ".comment-toggle", toggleComments);

	$("#index, #comments").scroll(function(){
	    if(this.scrollLeft) this.scrollLeft=0;
  	})



	$('#article').on('load', function() {

		console.log(  "Load Time " + (new Date().getTime() - (window.loadTime||0)) + "ms: "+ this.src );

		try{
			$("#article").contents().keydown(keyDownHandler);

				$("#article")[0].contentWindow.focus();

			if (window.disablejs) 

				$("#index").focus()

		}catch(e){

			$("#index").focus()

			if ( !window.disablejs )
				$(".noscript").click()


		}

	   

	})


	window.onkeyup = keyDownHandler;

	$(".reply").click(function () {
		window.open( $(".cur").data("com") )
	})



	$(".share").click(function () {

		var url = $("#article").attr("src").split("url=")[1];
		

		$('<input type="text" id="copy-temp" style="opacity: 0;  position: absolute;"/>' )
			.val(url).appendTo("body")
		$("#copy-temp").select();

     	document.execCommand('copy');
	    
	  	$("#copy-temp").remove();


	})

	$(".opentab").click(function () {

		var url = $("#article").attr("src").split("url=")[1];
	
	   window.open( url );

	})


	$(".noscript").click(function () {

		window.disablejs = !($('iframe').attr('sandbox').indexOf("scripts")==-1);
		
		$('iframe').attr('sandbox',"allow-same-origin" + (disablejs ?  "" : " allow-scripts" ));


		$(this).text( (disablejs ?  "en" : "dis" )+"able js");
		$(".cur").mousedown();

	})

});


function loadIndex(nextPageURL) {

	$.get('/get?url=https://news.ycombinator.com/' + (nextPageURL||""), function(data) {

		$(data).find('.athing').each(function(){

			var a = $(this).find(".title a:first");
			var sub = $(this).next().find(".subtext");
			var points = parseInt(sub.find("span").eq(0).text()) || 0;
			var comUrl = "https://news.ycombinator.com/" +sub.find("a").eq(1).attr('href');
			var url = a.attr('href') && a.attr('href').length > 2 ? a.attr('href') : comUrl;

			$("<div class='link-div' style='line-height:1" + 	(15 + Math.min(Math.ceil(points / 30), 13)) +
				 "%; font-size:" + (15 + Math.min(Math.ceil(points / 20), 13)) + "px'>"+ a.text() + "</div>"
			).appendTo("#index").data("url", url).data("com", comUrl)


		});

		if (--pageCount)
			loadIndex($(data).find("a[href*='news?p']").attr('href'))
		
		

		if (!nextPageURL) //click first link
	 		$(".link-div:first").mousedown();
	});
}


function loadArticle(e) {

	//clear cookies
	 var cookies = document.cookie.split(";");

   	for (var i = 0; i < cookies.length; i++) {
    	  var cookie = cookies[i];
    	  var eqPos = cookie.indexOf("=");
    	  var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    	  document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    	}

	if (e.which && e.which != 1){
		window.open($(this).data("url"));
		return;
	}
	
	var storyURL = $(this).data("url"),
	commentsURL= $(this).data("com");
	var cont = $("#comments-container");

	cont.empty();

	var skip, priorWasTop;

	if (Element.prototype.scrollIntoViewIfNeeded)
		this.scrollIntoViewIfNeeded();

	$(".cur").removeClass("cur")

	$(this).addClass("cur");

	window.loadTime = (new Date()).getTime();

	if ($("iframe")[0].contentWindow.window.length) //if iframe is accessible
		$('#article').contents().find('body').empty();
	
	$('#article').attr("src", '/get?url=' + storyURL);

	$("#comments").scrollTop(0);

	$.get('/get?url='+commentsURL, function(data) {

		$(data).find("tr td table tbody tr").each(function() {
			skip = !skip;
			if (!skip) {
				var level = Math.floor($(this).find("td img").attr("width") / 3);
				cmClass = "comment-" + (!level ? "top" : "sub:");

				var commentText = '';
				$(this).find(".comment span").each(function() {

					 $(this).find('.reply').remove()

					if ($(this).text() != 'reply' )
						commentText += $(this).html();
				})


				if (commentText.length > 2) {
					var userName = $(this).find("span a").first().text();
					var toggle = "";

					if (level && priorWasTop) {
						priorWasTop = false;
						toggle = "<span class='comment-toggle minus'></span> ";
					}
					if (!level)
						priorWasTop = true;
					cont.append(toggle + "<div class='" + cmClass + "' style='margin-left:" + level + "px'>" + "<b>" + userName + ":</b> " + commentText + "</div>");
				}
			}
		})

		if ( !cont.text() )
			cont.text("No comments");

	});
}

function toggleComments() {
	var e = $(this);	

	if (e.hasClass( "minus") ) {

		var hideOn;
		var somethingWasHidden;
		$("#comments-container div").each(function() {
			if ($(this).attr("class") == "comment-top")
				hideOn = false;
			if (hideOn) {
				somethingWasHidden = true;
				$(this).slideUp()

			}
			if (this.textContent == $(e).prev().text())
				hideOn = true;
		});

		if (somethingWasHidden)
			e.removeClass("minus").addClass("plus");

	} else {
		e.removeClass("plus").addClass("minus");
		var showOn;
		$("#comments-container div").each(function() {
			if ($(this).attr("class") == "comment-top")
				showOn = false;
			if (showOn)
				$(this).slideDown();

			if (this.textContent == $(e).prev().text())
				showOn = true;
		});

	}

}


function keyDownHandler(e) {
	var key = e.keyCode;

	//next
	if ([39,74].indexOf(key)>-1) 
	 	$(".cur+.link-div, .link-div:first").last().mousedown();


	if ([37,75].indexOf(key)>-1) 
		$(".cur").prev().mousedown()

	if(key==113)
		$(".noscript").click()

	if(key==67)
		$('#comments').focus()

	if(key==38)
		$("iframe:focus").contents().scrollTop( $("iframe").contents().scrollTop() - 40)

	if(key==40)
		$("iframe:focus").contents().scrollTop( $("iframe").contents().scrollTop() + 40)
}


//google analytics
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
	(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
	m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
	})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
	ga('create', 'UA-45764194-2', 'hkrnews.com'); ga('send', 'pageview');

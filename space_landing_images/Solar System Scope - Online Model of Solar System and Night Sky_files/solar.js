$(function () {

	SolarSystemScope.Platforms.Init();
	if (!SolarSystemScope.IsIFrame())
	{
		SolarSystemScope.Cookies.InitDisclaimer();
		SolarSystemScope.InitModal();
		//SolarSystemScope.InitStickyNavbar();
	}
	
});

var SolarSystemScope = SolarSystemScope || {};

SolarSystemScope.Platforms = {
	
	Init: function() {
	
		if (SolarSystemScope.Platforms.initDone === true)
			return;
		SolarSystemScope.Platforms.initDone = true;
		
		var body = $('body');
		if (!body.hasClass("mbl") && !body.hasClass("dsk")) {
			var md = new MobileDetect(window.navigator.userAgent);
			if (md.mobile()) {
				body.addClass("mbl");
				var os = md.os();
				if (os == "AndroidOS") body.addClass("and");
				else if (os == "iOS") body.addClass("ios");
			}
			else
				body.addClass("dsk");
		}
		SolarSystemScope.Platforms.isMobile = body.hasClass("mbl");
		SolarSystemScope.Platforms.isDesktop = body.hasClass("dsk");
	}
	
};

SolarSystemScope.Cookies = SolarSystemScope.Cookies || {
	
	Get: function(cname) {
		
		var name = cname + "=";
		var decodedCookie = decodeURIComponent(document.cookie);
		var ca = decodedCookie.split(';');
		for (var i = 0; i < ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) == ' ')
				c = c.substring(1);
			if (c.indexOf(name) == 0)
				return c.substring(name.length, c.length);
		}
		return "";
	},

	Set: function (cname, cvalue, exdays) {
		var d = new Date();
		d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
		var expires = "expires=" + d.toUTCString();
		document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
	},
	
	InitDisclaimer: function() {
		if (SolarSystemScope.Cookies.Get("cookiesOK") != "ok") {
			var cookiesDisclaimer = $("<div class=\"cookies-disclaimer\">Solar System Scope website uses Cookies</div>");
			var cookiesDisclaimerButton = $("<a class=\"btn-type-1-blue\">Got it!</a>");
			cookiesDisclaimerButton.click(function () {
				SolarSystemScope.Cookies.Set("cookiesOK", "ok", 365);
				$(".cookies-disclaimer").remove();
			});
			cookiesDisclaimer.append(cookiesDisclaimerButton);
			$("body").append(cookiesDisclaimer);
		}
	}
};

SolarSystemScope.InitModal = SolarSystemScope.InitModal || function() {
	
	var modalDialog = $('<div class="modal-dialog"></div>');
	var modalHolder = $('<div class="modal fade" tabindex="-1" role="dialog" aria-labelledby=" label" aria-hidden="true"></div>');
	modalHolder.append(modalDialog);
	$('body').append(modalHolder);
	
	$("a[data-modal]").on("click", function (e) {

		var url = $(this).attr('data-modal-url');
		modalDialog.load(url, function () {
			modalHolder.modal({
				keyboard: true
			}, 'show');
		});
		return false;
	});
	
};

SolarSystemScope.InitStickyNavbar = SolarSystemScope.InitStickyNavbar || function() {
	
	var navbar = $('#header > .navbar');
    var sticky_navigation_offset_top = navbar.offset().top;
    var sticky_navigation = function () {
        if ($(window).scrollTop() > sticky_navigation_offset_top)
            navbar.addClass('fixed');
        else
            navbar.removeClass('fixed');
    };
    $(window).scroll(sticky_navigation);
	sticky_navigation();
	
};

SolarSystemScope.Logout = SolarSystemScope.Logout || function() {
	
	$.ajax({
		type : 'POST',
		url  : '../../../../api/signout.php',
		success :  function() {
			window.location.reload();
		}
	});	
	
};

SolarSystemScope.IsIFrame = SolarSystemScope.IsIFrame || function() {
	return window.location !== window.parent.location;
}

SolarSystemScope.GeneratePassword = SolarSystemScope.GeneratePassword || function(length) {
	if (!length)
		length = 8;
    var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    var pass = "";
    for (var x = 0; x < length; x++) {
        var i = Math.floor(Math.random() * chars.length);
        pass += chars.charAt(i);
    }
    return pass;
}

SolarSystemScope.Parallax = SolarSystemScope.Parallax || {

	Objects: [],
	
	UpdateObjects: function(elementOnly) {
		
		if (SolarSystemScope.Parallax.available !== true)
			return;
		
		if (!SolarSystemScope.Parallax.Objects)
			return;
		
		var documentElement = $(document);
		var documentHeight = documentElement.height();
		var windowElement = $(window);
		var windowHeight = windowElement.height();
		var windowTop = windowElement.scrollTop();
		var windowBottom = windowTop + windowHeight;
		var windowCenter = windowTop + windowHeight / 2;
		
		SolarSystemScope.Parallax.Objects.forEach(function(object) {
			
			if (elementOnly && object.element != elementOnly)
				return;
				
			if ($.isFunction(object.beforeUpdate))
				object.beforeUpdate();
			
			var element = object.element;
			var type = object.type;
			var fixed = .5;
			if (typeof object["fixed"] !== 'undefined')
				fixed = object.fixed;
			
			var elementTop = element.offset().top;
			if (type == "element")
				elementTop -= object.parallaxDelta;
				
			var elementHeight = element.outerHeight();
			var elementBottom = elementTop + elementHeight;
			var elementCenter = elementTop + elementHeight / 2;
			
			if (type == "background" && (windowBottom < elementTop || windowTop > elementBottom))
				return;
			
			var parallaxCenter = elementCenter;
			if (typeof object["enableScreenLimits"] !== 'undefined')
			{
				if      (parallaxCenter <                  windowHeight / 2) parallaxCenter =                  windowHeight / 2;
				else if (parallaxCenter > documentHeight - windowHeight / 2) parallaxCenter = documentHeight - windowHeight / 2;
			}
			object.parallaxDelta = (windowCenter - parallaxCenter) * fixed;
			
			//if (type == "element" && (windowBottom < elementTop + parallaxDelta || windowTop > elementBottom + parallaxDelta))
			//	return;
		
			switch (type) {
				
				case "background":
					
					if (typeof object["enableScreenLimits"] !== 'undefined' && object["backgroundHeight"] !== 'undefined')
					{
						var backgroundHeight = object["backgroundHeight"];
						var parallaxMaxWindow = (windowHeight - elementHeight) / 2;
						if      (parallaxMaxWindow > elementTop)                     parallaxMaxWindow = elementTop;
						else if (parallaxMaxWindow > documentHeight - elementBottom) parallaxMaxWindow = documentHeight - elementBottom;
						parallaxMaxWindow *= fixed;
						var parallaxMaxBackground = (backgroundHeight - elementHeight) / 2;
						if (parallaxMaxBackground < parallaxMaxWindow)
							object.parallaxDelta *= parallaxMaxBackground / parallaxMaxWindow;
						var backgroundTop = elementHeight / 2 - backgroundHeight / 2 + object.parallaxDelta;
						element.css({ backgroundPositionY: backgroundTop + "px" });
					}
					else
					{
						element.css({ backgroundPositionY: "calc(50% + " + object.parallaxDelta + "px)" });
					}
					break;
					
				case "element":

					element.offset({ top: elementTop + object.parallaxDelta});
					break;
			}
		});
	},
	
	OnScroll: function() {
		SolarSystemScope.Parallax.UpdateObjects();
	},
	
	Init: function() {
		if (SolarSystemScope.Parallax.initDone === true)
			return;
		SolarSystemScope.Parallax.initDone = true;
		SolarSystemScope.Platforms.Init();
		if (SolarSystemScope.Platforms.isMobile)
			return;
		SolarSystemScope.Parallax.available = true;
		$(window).on('scroll resize', SolarSystemScope.Parallax.OnScroll);
		$(document).ready(SolarSystemScope.Parallax.Ready);
	},
	
	Ready: function() {
		SolarSystemScope.Parallax.Objects.forEach(function(object) {
			switch (object.type) {
				case "element":    object.element.css({visibility: "visible"}); break;
				case "background": object.element.css({backgroundImage: object.backgroundImage}); break;
			}
		});
		SolarSystemScope.Parallax.UpdateObjects();
	},
	
	AddElement: function(element, params) {
		SolarSystemScope.Parallax.Init();
		if (SolarSystemScope.Parallax.available !== true)
			return;
		if (!params)
			params = {};
		params.type = "element";
		params.element = element;
		params.parallaxDelta = 0;
		if (!$.isReady)
			element.css({visibility: "hidden"});
		SolarSystemScope.Parallax.Objects.push(params);
		SolarSystemScope.Parallax.UpdateObjects(element);
	},
	
	AddBackground: function(element, params) {
		SolarSystemScope.Parallax.Init();
		if (SolarSystemScope.Parallax.available !== true)
			return;
		if (!params)
			params = {};
		params.type = "background";
		params.element = element;
		params.backgroundImage = element.css("background-image");
		params.parallaxDelta = 0;
		if (!$.isReady)
			element.css({backgroundImage: ""});
		SolarSystemScope.Parallax.Objects.push(params);
		SolarSystemScope.Parallax.UpdateObjects(element);
	}
	
};
/* 
 Created on : Jul 4, 2017, 12:43:10 AM
 Author     : Atta-Ur-Rehman Shah (http://attacomsian.com)
 */
$(function () {
    //init 
    init();
    //init wow effects
    new WOW().init();

    //scroll menu
    $(window).scroll(function () {
        init();

        var $sections = $('section');
        var currentScroll = $(this).scrollTop();
        var $currentSection;

        $sections.each(function() {
            var divPosition = $(this).offset().top;
            if (divPosition - 1 < currentScroll + 75) {
                $currentSection = $(this);
            }
            var id = $currentSection.attr('id');
            $('.nav-link').removeClass('active').blur();
            $("[href=\\#" + id + "]").addClass('active');
            // $('.nav-link').css("color", "hsla(0,0%,100%,.5)");
            // $("[href=\\#" + id + "]").css("color", "white");
        });
    });

    //page scroll
    $('a.page-scroll').bind('click', function (event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top - 50
        }, 1500, 'easeInOutExpo');
        event.preventDefault();
    });

    //init function
    function init() {
        var secondFeature = $('#features').offset().top;
        var scroll = $(window).scrollTop();
        if (scroll >= 40 && $(window).width() > 960) {
            $('.sticky-navigation').css({"background-color": '#d81b60'});
        } else {
            $('.sticky-navigation').css({"background-color": '#d81b60'});
        }
        if (scroll >= secondFeature - 10) {
            $(".mobileScreen").css({'background-position': 'center top'});
        }
    }

    //canvas
    var ctx = $('#canvas-pixel')[0].getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;

    function setCanvas(rgbArr) {
        var ctxID = ctx.createImageData(1000,1000);
        for (var i = 0; i < Object.keys(rgbArr).length; i++) {
            for (var j = 0; j < rgbArr[i].length; j++) {
                ctxID.data[i * rgbArr[i].length + j] = rgbArr[i][j];
            }
        }
        ctx.putImageData(ctxID, 0, 0);
    }   

    $.ajax({
        url: "http://162.213.250.102:6500/getPixelData",
        type: 'GET',
        header:{'Access-Control-Allow-Origin': '*'},
        crossDomain: true,
        dataType: 'json',
        beforeSend: function() {
            $('#canvas-pixel').fadeOut(5000);
        },
        success: function(response) {
            $('#canvas-pixel').css('background', 'initial');
            $('#canvas-pixel').stop().hide().addClass('img-fadeIn').fadeIn(3000);
            $('#canvas-overlay').fadeIn(3000);
            setCanvas(response);

        }
    });

    // auto highlight link from scroll

});
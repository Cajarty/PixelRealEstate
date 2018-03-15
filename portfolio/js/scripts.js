/* 
 Created on : Jul 4, 2017, 12:43:10 AM
 Author     : Atta-Ur-Rehman Shah (http://attacomsian.com)
 */
$(function() {

    //init 
    init();
    //init wow effects
    new WOW().init();

    //scroll menu
    $(window).scroll(function() {
        init();

        var $sections = $('section');
        var currentScroll = $(this).scrollTop();
        var $currentSection;

        $sections.each(function() {
            // var divPosition = $(this).offset().top;
            // if (divPosition - 1 < currentScroll + 75) {
            //     $currentSection = $(this);
            // }
            // var id = $currentSection.attr('id');
            // $('.nav-link').removeClass('active').blur();
            // $("[href=\\#" + id + "]").addClass('active');


            // $('.nav-link').css("color", "hsla(0,0%,100%,.5)");
            // $("[href=\\#" + id + "]").css("color", "white");
        });
    });

    //page scroll
    $('a.page-scroll').bind('click', function(event) {
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
            $('.sticky-navigation').css({ "background-color": '#d81b60' });
            // $('.sticky-navigation').css({ "background-color": '#89cff0' });
        } else {
            $('.sticky-navigation').css({ "background-color": '#d81b60' });
            // $('.sticky-navigation').css({ "background-color": '#89cff0' });
        }
        if (scroll >= secondFeature - 10) {
            $(".mobileScreen").css({ 'background-position': 'center top' });
        }
    }

    setInterval(() => {
        var timestamp = new Date().getTime();
        var src = './img/canvas.png';
        let img = new Image();
        img.onload = () => {
            $('#canvas-image').attr('src', img.src);
        };
        img.src = src + '?' + timestamp;
    }, 5000);
    
});
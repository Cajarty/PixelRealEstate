$(function() {

    if ($(".toggle .toggle-title").hasClass('active')) {
        $(".toggle .toggle-title.active").closest('.toggle').find('.toggle-inner').show();
    }
    $(".toggle .toggle-title").click(function() {
        if ($(this).hasClass('active')) {
            $(this).removeClass("active").closest('.toggle').find('.toggle-inner').slideUp(200);
            $(this).find('i').removeClass('fa-caret-up').addClass('fa-caret-down');
        } else {   
            $(this).addClass("active").closest('.toggle').find('.toggle-inner').slideDown(200);
            $(this).find('i').removeClass('fa-caret-down').addClass('fa-caret-up');
        }
    });
    
    var $faqs = $('.toggle');
    $('#filter').keyup(function() {
        var val = this.value.toLowerCase();
        $faqs.show().filter(function() {
            var title = $(this).find('.toggle-title').text().toLowerCase();
            return title.indexOf(val) < 0;
        }).hide();
    });

});
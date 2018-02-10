$(function() {
    
    $('#contact-btn').on('click', function() {
        $(this).hide();
        $('#div-form').slideToggle(500);
    });

    $('#send-btn').on('click', function() {
        
        var name = $('#name');
        var email = $('#email');
        var email2 = $('#email2');
        var subject = $('#subject');
        var message = $('#message');
        var elements = [name, email2, subject, message];
        var fail = false;
        var spam = false;

        for (var i = 0; i < elements.length; i++) {
            if (elements[i].val() == '') {
                fail = true;
                elements[i].css('border', '1px solid red');
            } else {
                elements[i].css('border', '1px solid #ced4da');   
            }
        }
        if (fail) {
            return;
        }
        // prevent bot spam
        if (email.val() != '') {
            spam = true;
        }

        $('.form-control').css('border', '1px solid #ced4da');

        for (var i = 0; i < elements.length; i++) {
            elements[i].val('');
        }

        $(this).parent().slideToggle();
        $('#div-success').slideToggle();

    });
});
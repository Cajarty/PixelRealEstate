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
        // // prevent bot spam
        if (email.val() != '') {
            spam = true;
        }

        $('.form-control').css('border', '1px solid #ced4da');

        var data = {'name': name.val(), 'email': email2.val(), 'spam': email.val(), 'subject': subject.val(), 'message': message.val()};
        data = JSON.stringify(data);

        var sendBtn = $(this);

        $.ajax({
            type: "POST",
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            url: 'php/mail.php',
            data: data,
            success: function(data) {
                console.log('success', data);
                if (data.message == 'sent') {
                    for (var i = 0; i < elements.length; i++) {
                        elements[i].val('');
                    }
                    sendBtn.parent().slideToggle();
                    $('#div-success').slideToggle();
                } else {
                    sendBtn.parent().slideToggle();
                    $('#div-fail').slideToggle();
                }
            },
            error: function(error) {
                console.log('error', error);
                sendBtn.parent().slideToggle();
                $('#div-fail').slideToggle();
            }
        });
    });
});
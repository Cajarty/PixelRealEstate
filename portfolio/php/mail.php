<?php
    
    use PHPMailer\PHPMailer\PHPMailer;
    use PHPMailer\PHPMailer\SMTP;
    use PHPMailer\PHPMailer\Exception;
    require_once 'PHPMailer/src/PHPMailer.php';
    require_once 'PHPMailer/src/Exception.php';
    require_once 'PHPMailer/src/SMTP.php';
    

    $mail = new PHPMailer(true);
    $mail->setFrom('xxxx@domainname.com', 'First Last');
    $mail->addAddress("xxxx@domainname.com", "Recepient Name");
    $mail->addReplyTo("xxxx@domainname.com", "Reply");
    $mail->isHTML(true);

    $mail->Subject = "Subject Text";
    $mail->Body = "<i>Mail body in HTML</i>";
    $mail->AltBody = "This is the plain text version of the email content";

    if(!$mail->send()) 
    {
        echo "Mailer Error: " . $mail->ErrorInfo;
    } 
    else 
    {
        echo "Message has been sent successfully";
    }


    die('b');

    $data = file_get_contents('php://input');
    $data = json_decode($data);

    $name = $data->name;
    $email = $data->email;
    $spam = $data->spam;
    $subject = $data->subject;
    $message = $data->message;
    $headers = ["From: from@example.com",
        "Reply-To: replyto@example.com",
        "X-Mailer: PHP/" . PHP_VERSION
    ];
    $headers = implode("\r\n", $headers);

    if ($spam) {
        $return = ['success' => true];
    } else {
        $header = "From: noreply@example.com\r\n"; 
        $header.= "MIME-Version: 1.0\r\n"; 
        $header.= "Content-Type: text/html; charset=ISO-8859-1\r\n"; 
        $header.= "X-Priority: 1\r\n"; 

        $status = mail('arthurpankiewicz@gmail.com', '$subject', '$message', $header);

        if ($status) { 
            $return = ['success' => true, 'message' => '<p>Your mail has been sent!</p>'];
        } else { 
            $return = ['success' => true, 'message' => '<p>Something went wrong, Please try again!</p>']; 
        }
    }

    echo json_encode($return);
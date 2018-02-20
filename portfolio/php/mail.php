<?php
    
    use PHPMailer\PHPMailer\PHPMailer;
    use PHPMailer\PHPMailer\Exception;
    require '../vendor/autoload.php';

    $mail = new PHPMailer(true);
    
    try {
        $data = file_get_contents('php://input');
        $data = json_decode($data);

        // if ($data->spam) {
            // echo json_encode(['success' => true, 'message' => 'spam']);
        // }
        
        $email = filter_var($data->email, FILTER_SANITIZE_EMAIL);
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            jdie(true, 'fail');
        }
        
        //Server settings
        $mail->isSMTP();                                      // Set mailer to use SMTP
        // $mail->SMTPDebug = 1;                                 // Enable verbose debug output
        $mail->Host = 'smtp1.example.com;smtp2.example.com';  // Specify main and backup SMTP servers
        $mail->SMTPAuth = true;                               // Enable SMTP authentication
        $mail->SMTPSecure = 'ssl';                            // secure transfer enabled REQUIRED for Gmail
        $mail->Host = "smtp.gmail.com";
        $mail->Port = 465; // or 587
        $mail->Username = 'pixelpropertysmtp@gmail.com';      // SMTP username
        $mail->Password = '06!2Pt2nd0$1';                     // SMTP password

        $mail->setFrom($email, $data->name);
        $mail->addAddress('contact@pixelproperty.io', 'Contact (For Press)');
        $mail->addReplyTo($email, $data->name);

        $mail->isHTML(true);
        $mail->Subject = 'Contact Form (For Press): ' . $data->subject;
        $mail->Body = $data->message . "<br/><br/>" . 'Sent from: "' . $data->name . ' <' . $email . '>"';

        $mail->send();
        jdie(true, 'sent');
    } catch (Exception $e) {
        jdie(false, 'fail');
        echo json_encode(['success' => false, 'message' => 'fail', 'error' => var_export($e), 'mail' => $mail->ErrorInfo]);
    }

    function jdie($success, $message) {
        echo json_encode(['success' => $success, 'message' => $message]);
        die();
    }
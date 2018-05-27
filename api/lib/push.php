<?php
use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;

class Push
{
  private $database;
  private $user;
  private $webPush;

  public function __construct($database, $protect)
  {
    $email = 'johnandersenpdx@gmail.com';
    $this->database = $database;
    $this->user = $protect->user_data();
    $this->webPush = new WebPush(array(
      'VAPID' => array(
        'subject' => 'mailto:' . $email,
        'pemFile' => '../../keys/vapid/private_key.pem',
      )
    ));
  }

  public function send($message)
  {
    $push = $this->database->get_push($this->user->getClaim('uid'));
    if ($push['push_endpoint'] == NULL) {
      return false;
    }
    $this->webPush->sendNotification(
      Subscription::create([
        'endpoint'        => $push['push_endpoint'],
        'publicKey'       => $push['push_public_key'],
        'authToken'       => $push['push_auth_token'],
        'contentEncoding' => 'aesgcm',
      ]),
      $message,
      true
    );
  }
}
?>

<?php
require_once(__DIR__ . '/../dist/api/vendor/autoload.php');
use Minishlink\WebPush\VAPID;

var_dump(VAPID::createVapidKeys());
?>

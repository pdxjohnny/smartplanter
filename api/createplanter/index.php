<?php
// Requires
require_once('../lib/all.php');
header('Content-Type: application/json');

$protect = new ProtectWithAuth;
$user = $protect->user_data();
if ($user == false) {
  $err = new ErrorResponse;
  $err->code = 403;
  $err->message = "Invalid token";
  $err->render();
  return;
}

$database = new Database;
$resource = array();
if (0 == strcmp($_SERVER['REQUEST_METHOD'], 'POST')) {
  $resource = $database->create_planter($user->getClaim('uid'),
    fopen('php://input', 'r'));
}

echo json_encode_utf8($resource);
?>

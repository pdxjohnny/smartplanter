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
$resource = $database->create_planter($user->getClaim('uid'));

echo json_encode_utf8($resource);
?>

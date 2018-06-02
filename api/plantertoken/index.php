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

if (0 == strcmp($_SERVER['REQUEST_METHOD'], 'GET')) {
  $resource = client_input(array(
    'id' => FILTER_SANITIZE_NUMBER_INT,
  ));
  $database = new Database;
  $resource = $database->planter_token($user->getClaim('uid'), $resource['id']);

  echo json_encode_utf8($resource);
}
?>

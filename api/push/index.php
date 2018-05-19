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
if (0 == strcmp($_SERVER['REQUEST_METHOD'], 'POST')) {
  $resource = client_input(array(
    'endpoint' => FILTER_SANITIZE_URL,
    'public_key' => FILTER_SANITIZE_STRING,
    'auth_token' => FILTER_SANITIZE_STRING,
  ));
  $resource = array(
    'udpated' => $database->update_push($user->getClaim('uid'),
      $resource['endpoint'],
      $resource['public_key'],
      $resource['auth_token']),
  );
} else {
  $err = new ErrorResponse;
  $err->code = 400;
  $err->message = "Method must be POST";
  $err->render();
  return;
}

echo json_encode_utf8($resource);
?>

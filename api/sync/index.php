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
if (0 == strcmp($_SERVER['REQUEST_METHOD'], 'GET')) {
  $resource = client_input(array(
    'resource' => FILTER_SANITIZE_STRING,
  ));
  if ($user->hasClaim('pid')) {
    $resource['resource'] = $user->getClaim('pid');
  }
  if ($resource['resource'] == NULL) {
    $err = new ErrorResponse;
    $err->code = 404;
    $err->message = "Resource not specified";
    $err->render();
    return;
  }
  $resource = $database->get_resource($user->getClaim('uid'),
    $resource['resource']);
} else if (0 == strcmp($_SERVER['REQUEST_METHOD'], 'POST')) {
  $resource = array(
    'id' => $database->create_resource($user->getClaim('uid'),
      fopen('php://input', 'r')),
  );
} else if (0 == strcmp($_SERVER['REQUEST_METHOD'], 'PUT')) {
  $resource = client_input(array(
    'resource' => FILTER_SANITIZE_STRING,
  ));
  if ($user->hasClaim('pid')) {
    $resource['resource'] = $user->getClaim('pid');
  }
  if ($resource['resource'] == NULL) {
    $err = new ErrorResponse;
    $err->code = 404;
    $err->message = "Resource not specified";
    $err->render();
    return;
  }
  $resource = array(
    'udpated' => $database->update_resource($user->getClaim('uid'),
      $resource['resource'],
      fopen('php://input', 'r')),
  );
} else {
  $err = new ErrorResponse;
  $err->code = 400;
  $err->message = "Method must be GET, POST, or PUT";
  $err->render();
  return;
}

echo json_encode_utf8($resource);
?>

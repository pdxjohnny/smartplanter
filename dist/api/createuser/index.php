<?php
// Requires
require_once('../lib/all.php');
header('Content-Type: application/json');

$args = array(
    'password'  =>  FILTER_SANITIZE_ENCODED,
);

$user = client_input($args);
if ($user == false || $user['password'] == false) {
    $err = new ErrorResponse;
    $err->code = 400;
    $err->message = "Password required";
    $err->render();
    return;
}

$database = new Database;
$user = $database->create_user($user);
if ($user == false) {
    $err = new ErrorResponse;
    $err->code = 401;
    $err->message = "Registration error";
    $err->render();
    return;
}

echo json_encode_utf8($user);
?>

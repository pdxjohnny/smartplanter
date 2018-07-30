<?php
// Requires
require_once('../lib/all.php');
header('Content-Type: application/json');

function openssl_errored() {
  $ret = "";
  while ($msg = openssl_error_string()) {
    $ret .= $msg;
  }
  return $ret;
}

if (0 == strcmp($_SERVER['REQUEST_METHOD'], 'POST')) {
  // Get input data from POST body in JSON form
  $input = json_decode(file_get_contents('php://input'));

  // Decode the base 64 encoded signature
  $input->signature = base64_decode($input->signature);

  // Load the public key
  $input->publicKey = openssl_pkey_get_public($input->publicKey);
  if ($input->publicKey == false) {
    return new ErrorResponse(400, openssl_errored());
  }
  // OpenSSL leaves errors around even when it didn't error
  while ($msg = openssl_error_string()) {}

  $ok = openssl_verify($input->data, $input->signature, $input->publicKey,
    OPENSSL_ALGO_SHA512);
  if ($ok == 1) {
    return new ErrorResponse(200, "good signature");
  } else {
    return new ErrorResponse(400, openssl_errored());
  }
  // free the key from memory
  openssl_free_key($input->publicKey);
} else {
  return new ErrorResponse(400, "Method must be POST");
}
?>

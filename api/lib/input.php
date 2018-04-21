<?php
/*
 * Returns input from get or post
 * Sample usage
$args = array(
    'id'		=> FILTER_VALIDATE_INT,
    'username'	=> FILTER_SANITIZE_ENCODED,
    'password'	=> FILTER_SANITIZE_ENCODED,
);
 */
function client_input($args) {
    // Try to get data from GET
    $input = filter_input_array(INPUT_GET, $args);
    if ($input != NULL) {
        return $input;
    }
    // Try to get data from POST
    $input = filter_input_array(INPUT_POST, $args);
    if ($input != NULL) {
        return $input;
    }
    // Couldnt get input
    return false;
}
?>

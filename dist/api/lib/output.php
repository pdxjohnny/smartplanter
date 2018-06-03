<?php
/*
 * Outputs json which contains UTF-8
 */
function json_encode_utf8($output) {
    return json_encode(utf8ize($output));
}

function utf8ize($d) {
    if (is_array($d)) {
        foreach ($d as $k => $v) {
            $d[$k] = utf8ize($v);
        }
    } else if (is_string ($d)) {
        return utf8_encode($d);
    }
    return $d;
}

function xssafe($data, $encoding='UTF-8') {
    return htmlspecialchars($data, ENT_QUOTES | ENT_HTML5, $encoding);
}
?>

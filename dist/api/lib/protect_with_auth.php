<?php
class ProtectWithAuth {
    private $auth;

    // Initialize our auth member
    public function __construct() {
        $this->auth = new Auth;
        $this->err_response = new ErrorResponse;
    }

    public function redirect($status, $url) {
        http_response_code($status);
        header('Location: ' . $this->auth->origin() . $url);
        return true;
    }

    public function set_token_and_redirect($user, $status, $url) {
        $this->redirect($status, $url);
        setcookie("token", $user['token'], time() + 3600, '/');
    }

    public function token() {
        if (isset($_COOKIE['token'])) {
            return $_COOKIE['token'];
        }
        if (isset(getallheaders()['Authorization'])) {
            return str_replace("Bearer ", "", getallheaders()['Authorization']);
        }
        return false;
    }

    // Ensures that a user is logged in to see this resource
    public function logged_in() {
        $token = $this->token();
        if ($token) {
            return $this->auth->verify($token);
        }
        return false;
    }

    public function user_data() {
        if (!$this->logged_in()) {
            return false;
        }
        $token = $this->auth->token($this->token());
        $token->getClaims();
        return $token;
    }

    // Ensures that a user has permission to see resource
    public function permission($permission) {
        // They need to be logged in to have any permissions
        if (!$this->logged_in()) {
            return false;
        }
        // FIXME Parse the JWT to see if they have that permission
    }

    // Sends the client a 401 or 403
    public function error($loggedin, $err_message) {
        $this->err_response->message = $err_message;
        // Logged in but error, so they are Forbidden
        if ($loggedin) {
            $this->err_response->code = 403;
        } else {
            // Not logged in so Unauthorized
            $this->err_response->code = 401;
        }
        // Render the error message
        return $this->err_response->render();
    }
}
?>

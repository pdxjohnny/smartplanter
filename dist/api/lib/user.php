<?php
class User {
    public $id;
    public $email;
    private $password;

    public function __construct($user) {
        $this->id = $user['id'];
        if (array_key_exists('password', $user)) {
          $this->password = $user['password'];
        }
    }

    public function to_array() {
        return array(
            'id'        =>  $this->id,
            'password'  =>  $this->password,
        );
    }

    public function to_html() {
        $grav_url = "https://www.gravatar.com/avatar/";
        $grav_url .= md5(strtolower(trim($this->email)));
        $html = "<div class=\"item\">";
        $html .= "<img class=\"ui avatar image\" src=\"" . $grav_url . "\">";
        $html .= "<div class=\"content\">";
        $html .= "<a class=\"header\" href=\"/search/?email=" . $this->email . "\">" . $this->email . "</a>";
        $html .= "</div>";
        $html .= "</div>";
        return $html;
    }
}
?>

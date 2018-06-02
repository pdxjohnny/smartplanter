<?php
class Database
{
    private $token;
    private $db;

    public function __construct()
    {
        $this->auth = new Auth;
        $this->db = null;
        try {
            /*
            $conn = 'mysql:host=' . $_ENV['DB_PORT_3306_TCP_ADDR'] .
                    ';dbname=' . $_ENV['DB_ENV_MYSQL_DATABASE'] .
                    ';charset=utf8';
            $this->db = new PDO($conn,
                $_ENV['DB_ENV_MYSQL_USER'],
                $_ENV['DB_ENV_MYSQL_PASSWORD']
              );
             */
            // TODO Use a real database
            $conn = 'sqlite:../.master.db';
            $this->db = new PDO($conn);
            chmod('../.master.db', 0600);
        } catch (Exception $err) {
            error_log("ERROR: " . $err->getMessage());
            return;
        }
        $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $this->db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_OBJ);
        $this->db->setAttribute(PDO::MYSQL_ATTR_INIT_COMMAND, 'SET NAMES UTF8');
        $this->create_tables();
    }

    public function table_exists($table_name)
    {
        $exists = false;
        $statement = $this->db->prepare(
          "SELECT name FROM sqlite_master WHERE name=:table_name");
        $statement->bindValue(':table_name', $table_name, PDO::PARAM_STR);

        try {
            $statement->execute();

            if ($row = $statement->fetchAll(PDO::FETCH_ASSOC))
            {
                $exists = true;
            }
        } catch (Exception $err) {
            error_log("ERROR: " . $err->getMessage());
        }
        return $exists;
    }

    private function create_tables() {
        if (!$this->table_exists('USERS')) {
            $this->db->exec("CREATE TABLE IF NOT EXISTS USERS (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, email VARCHAR(100), password VARCHAR(2000) NOT NULL, push_endpoint VARCHAR(500), push_public_key VARCHAR(500), push_auth_token VARCHAR(500))");
        }
        if (!$this->table_exists('RESOURCES')) {
            $this->db->exec("CREATE TABLE IF NOT EXISTS RESOURCES (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, data BLOB, FOREIGN KEY(user_id) REFERENCES USERS(id))");
        }
    }

    public function update_push($user_id, $endpoint, $public_key, $auth_token) {
        $statement = $this->db->prepare("UPDATE USERS SET push_endpoint=:push_endpoint, push_public_key=:push_public_key, push_auth_token=:push_auth_token WHERE id=:user_id");
        $statement->bindValue(':user_id', $user_id, PDO::PARAM_INT);
        $statement->bindValue(':push_endpoint', $endpoint, PDO::PARAM_STR);
        $statement->bindValue(':push_public_key', $public_key, PDO::PARAM_STR);
        $statement->bindValue(':push_auth_token', $auth_token, PDO::PARAM_STR);
        $statement->execute();
        return true;
    }

    public function get_push($user_id) {
        $statement = $this->db->prepare("SELECT push_endpoint, push_public_key, push_auth_token FROM USERS WHERE id=:user_id");
        $statement->bindValue(':user_id', $user_id, PDO::PARAM_INT);
        $statement->execute();
        if ($row = $statement->fetch(PDO::FETCH_ASSOC)) {
            return $row;
        }
        return false;
    }

    public function get_resource($user_id, $resource_id) {
        $statement = $this->db->prepare("SELECT data FROM RESOURCES WHERE id=:resource_id AND user_id=:user_id");
        $statement->bindValue(':resource_id', $resource_id, PDO::PARAM_INT);
        $statement->bindValue(':user_id', $user_id, PDO::PARAM_INT);
        $statement->execute();
        if ($row = $statement->fetch(PDO::FETCH_ASSOC)) {
            return $row['data'];
        }
        return false;
    }

    public function create_resource($user_id, $data) {
        $statement = $this->db->prepare("INSERT INTO RESOURCES(user_id,data) VALUES(:user_id,:data)");
        $statement->bindValue(':user_id', $user_id, PDO::PARAM_INT);
        $statement->bindValue(':data', $data, PDO::PARAM_LOB);
        $statement->execute();
        return intval($this->db->lastInsertId());
    }

    public function update_resource($user_id, $resource_id, $data) {
        $statement = $this->db->prepare("UPDATE RESOURCES SET data=:data WHERE id=:resource_id AND user_id=:user_id");
        $statement->bindValue(':resource_id', $resource_id, PDO::PARAM_INT);
        $statement->bindValue(':user_id', $user_id, PDO::PARAM_INT);
        $statement->bindValue(':data', $data, PDO::PARAM_LOB);
        $statement->execute();
        return true;
    }

    public function create_planter($user_id) {
        $statement = $this->db->prepare("INSERT INTO RESOURCES(user_id) VALUES(:user_id)");
        $statement->bindValue(':user_id', $user_id, PDO::PARAM_INT);
        $statement->execute();
        $planter_id = intval($this->db->lastInsertId());
        $planter = array(
          'id' => $planter_id,
          'token' => $this->auth->create_planter_token($user_id, $planter_id)
        );
        return $planter;
    }

    public function planter_token($user_id, $resource_id) {
        $statement = $this->db->prepare("SELECT id FROM RESOURCES WHERE id=:resource_id AND user_id=:user_id");
        $statement->bindValue(':resource_id', $resource_id, PDO::PARAM_INT);
        $statement->bindValue(':user_id', $user_id, PDO::PARAM_INT);
        $statement->execute();
        if ($row = $statement->fetch(PDO::FETCH_ASSOC)) {
          return array(
            'id' => $resource_id,
            'token' => $this->auth->create_planter_token($user_id, $resource_id)
          );
        }
        return false;
    }

    public function user_id($email) {
        $email = array(
            'email'  =>  $email,
        );
        return $this->check_user($email)->id;
    }

    public function email($id) {
        $id = array(
            'id'    =>  $id,
        );
        return $this->check_user($id)->email;
    }

    public function check_user($user)
    {
        $email = false;
        // Check the user
        if (isset($user['id']))
        {
            $statement = $this->db->prepare('SELECT id,email FROM USERS WHERE id=:id');
            $statement->bindValue(':id', $user['id'], PDO::PARAM_INT);
        } else if (isset($user['email'])) {
            $statement = $this->db->prepare('SELECT id,email FROM USERS WHERE email=:email');
            $statement->bindValue(':email', $user['email'], PDO::PARAM_STR);
        } else {
            return false;
        }
        $statement->execute();
        if ($row = $statement->fetch(PDO::FETCH_ASSOC)) {
            return new User($row);
        }
        return false;
    }

    public function login_user($user)
    {
      if (!(isset($user['id']) ||
        isset($user['email'])) ||
        !isset($user['password'])) {
        return false;
      }
        $statement = false;
        // Lookup by id is faster
        if (isset($user['id'])) {
            $statement = $this->db->prepare('SELECT * FROM USERS WHERE id=:id');
            $statement->bindValue(':id', $user['id'], PDO::PARAM_INT);
        } else {
            $statement = $this->db->prepare('SELECT * FROM USERS WHERE email=:email');
            $statement->bindValue(':email', $user['email'], PDO::PARAM_STR);
        }

        $statement->execute();
        while ($row = $statement->fetch(PDO::FETCH_ASSOC))
        {
            if (password_verify($user['password'], $row['password'])) {
                unset($row['password']);
                $row['id'] = intval($row['id']);
                // Create a login token for the user
                $row['token'] = $this->auth->create_token($row);
                return $row;
            }
        }
        return false;
    }

    public function create_user($user) {
        // Check if this email is alreay taken
        if ($this->check_user($user) != false) {
            return false;
        }
        if ($user == NULL ||
          !isset($user['password']) ||
          $user['password'] == false)
        {
            return false;
        }
        // Hash the password
        $hash_options = array('cost' => 16);
        $user['password'] = password_hash($user['password'], PASSWORD_BCRYPT, $hash_options);
        if (
          isset($user['email']) &&
          $user['email'] != false) {
          $statement = $this->db->prepare("INSERT INTO USERS(email,password) VALUES(:email,:password)");
          $statement->bindValue(':email', $user['email'], PDO::PARAM_STR);
        } else {
          $statement = $this->db->prepare("INSERT INTO USERS(password) VALUES(:password)");
        }
        $statement->bindValue(':password', $user['password'], PDO::PARAM_STR);
        $statement->execute();
        $user['id'] = intval($this->db->lastInsertId());
        // Dont return the hashed password
        unset($user['password']);
        // Create a login token for the user
        $user['token'] = $this->auth->create_token($user);
        return $user;
    }

    public function clear($table)
    {
        $statement = $this->db->prepare('DELETE FROM "' . $table . '"');
        $statement->execute();
        return $result;
    }

}
?>

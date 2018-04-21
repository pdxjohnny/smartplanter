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
            // TODO Use a real database, also the perms are 644 which is not
            // ideal
            $conn = 'sqlite:../.master.db';
            $this->db = new PDO($conn);
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
            $this->db->exec("CREATE TABLE IF NOT EXISTS USERS (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, email VARCHAR(100), password VARCHAR(2000) NOT NULL)");
        }
        if (!$this->table_exists('RESOURCES')) {
            $this->db->exec("CREATE TABLE IF NOT EXISTS RESOURCES (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, data BLOB NOT NULL, FOREIGN KEY(user_id) REFERENCES USERS(id))");
        }
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

    public function award_resources($resources) {
        if ($resources == NULL) {
            return new Bounty;
        }
        $statement = $this->db->prepare("UPDATE RESOURCES SET awarded=:awarded WHERE id=:id AND creator=:creator");
        $statement->bindValue(':awarded', $resources->awarded, PDO::PARAM_INT);
        $statement->bindValue(':id', $resources->id, PDO::PARAM_INT);
        $statement->bindValue(':creator', $resources->creator, PDO::PARAM_INT);
        $statement->execute();
        // Add to the awrareds points
        $statement = $this->db->prepare("UPDATE USERS SET points=points + :points WHERE id=:awarded");
        $statement->bindValue(':points', $resources->points, PDO::PARAM_INT);
        $statement->bindValue(':awarded', $resources->awarded, PDO::PARAM_INT);
        $statement->execute();
        return $resources;
    }

    public function resourcess_to_award($creator, $onresources) {
        $statement = $this->db->prepare('SELECT * FROM RESOURCES WHERE creator=:creator ORDER BY awarded');
        $statement->bindValue(':creator', $creator, PDO::PARAM_INT);
        $statement->execute();
        while ($row = $statement->fetch(PDO::FETCH_ASSOC)) {
            $onresources(new Bounty($row));
        }
        return true;
    }

    public function resourcess_awarded($awarded, $onresources) {
        $statement = $this->db->prepare('SELECT * FROM RESOURCES WHERE awarded=:awarded ORDER BY points');
        $statement->bindValue(':awarded', $awarded, PDO::PARAM_INT);
        $statement->execute();
        while ($row = $statement->fetch(PDO::FETCH_ASSOC)) {
            $onresources(new Bounty($row));
        }
        return true;
    }

    public function top_100_resourcess($onresources) {
        $statement = $this->db->prepare('SELECT * FROM RESOURCES WHERE awarded IS NULL OR awarded = 0 ORDER BY points DESC LIMIT 100');
        $statement->execute();
        while ($row = $statement->fetch(PDO::FETCH_ASSOC)) {
            $onresources(new Bounty($row));
        }
        return true;
    }

    public function top_100_users($onuser) {
        $statement = $this->db->prepare('SELECT id,email,points FROM USERS ORDER BY points DESC LIMIT 100');
        $statement->execute();
        while ($row = $statement->fetch(PDO::FETCH_ASSOC)) {
            $onuser(new User($row));
        }
        return true;
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

    public function check_resources($resources)
    {
        if (isset($resources['id'])) {
            $statement = $this->db->prepare('SELECT * FROM RESOURCES WHERE id=:id');
            $statement->bindValue(':id', $resources['id'], PDO::PARAM_INT);
        } else {
            return false;
        }
        $statement->execute();
        if ($row = $statement->fetch(PDO::FETCH_ASSOC)) {
            return new Bounty($row);
        }
        return false;
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
        $hash_options = array('cost' => 11);
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

    public function table($table)
    {
        $statement = $this->db->prepare('SELECT * FROM `' . $table . '`');
        $statement->execute();
        $headers = false;
        echo "<h2 id='table_name_name' >" . $table . "</h2>";
        $this->table_options();
        echo "<table id='table' >";
        $all = array();
        while ($row = $statement->fetchAll(PDO::FETCH_ASSOC))
        {
            array_push($all, $row);
            if (!$headers)
            {
                echo "<thead><tr>";
                foreach ($row as $key => $value)
                {
                    echo "<th>" . $key . "</th>";
                }
                echo "</tr></thead><tbody>";
                $headers = true;
            }
            echo "<tr>";
            foreach ($row as $key => $value)
            {
                echo "<td>" . $value . "</td>";
            }
            echo "</tr>";
        }
        echo "</tbody></table>";
        echo "<script>var table_object = " . json_encode($all) . "</script>";
    }

    public function table_options()
    {
        echo "<button onclick=\"download($('#table_name_name').html() + '.csv', $('#table').table2CSV({delivery:'value'}));\" >Download</button>";
        echo "<button id=\"clear\" >Delete Data</button>";
        // echo "<select id='column' ><option value='0' > Column</option></select>";
        // echo "<select id='filter' ><option value='0' > Filter on</option></select>";
        // echo "<input id='sort' placeholder='Sort on' ></input>";
    }

    public function last_ticket($table)
    {
        $statement = $this->db->prepare('SELECT max(ticket) FROM "' . $table . '"');
        $statement->execute();
        if ($row = $statement->fetchAll(PDO::FETCH_ASSOC))
        {
            $ticket = $row['max(ticket)'];
        }
        $statement = $this->db->prepare('SELECT max(guest_ticket) FROM "' . $table . '"');
        $statement->execute();
        if ($row = $statement->fetchAll(PDO::FETCH_ASSOC))
        {
            $guest_ticket = $row['max(guest_ticket)'];
        }
        return ($ticket > $guest_ticket ? $ticket : $guest_ticket);
    }

    public function clear($table)
    {
        $statement = $this->db->prepare('DELETE FROM "' . $table . '"');
        $statement->execute();
        return $result;
    }

}
?>

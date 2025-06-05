<?php
require_once 'BaseDao.php';

class UserDao extends BaseDao {
    public function __construct() {
        parent::__construct("users");
    }

    public function getByEmail($email) {
        $stmt = $this->connection->prepare("SELECT * FROM users WHERE email = :email");
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        return $stmt->fetch();
    }

    public function emailExists($email) {
        $stmt = $this->connection->prepare("SELECT COUNT(*) FROM users WHERE email = :email");
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        return $stmt->fetchColumn() > 0;
    }

    public function authenticateUser($email, $password) {
        // This method is insecure and should not be used for authentication!
        // Use getByEmail and password_verify in the service layer instead.
        throw new Exception('Direct password authentication is not supported. Use getByEmail and password_verify.');
    }
}
?>

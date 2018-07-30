<?php
require_once(__DIR__ . '/../../../vendor/autoload.php');

class Auth
{
    private $signer;
    private $privateKey;
    private $publicKey;

    public function __construct() {
        $TOKEN_PRIVATE_KEY = __DIR__ . '/../../../keys/token/private.pem';
        $TOKEN_PUBLIC_KEY = __DIR__ . '/../../../keys/token/public.pem';
        $this->signer = new Lcobucci\JWT\Signer\Rsa\Sha256();
        $this->privateKey = new Lcobucci\JWT\Signer\Key('file://' . $TOKEN_PRIVATE_KEY);
        $this->publicKey = new Lcobucci\JWT\Signer\Key('file://' . $TOKEN_PUBLIC_KEY);
    }

    public function origin() {
        $protocol = stripos($_SERVER['SERVER_PROTOCOL'], 'https') === true ? 'https://' : 'http://';
        $domainName = $_SERVER['HTTP_HOST'] . '/';
        return $protocol . $domainName;
    }

    public function create_token($user) {
        $token = (new Lcobucci\JWT\Builder())->setIssuer($this->origin())
            ->setAudience($this->origin())
            ->setId($user['id'] . "_" . time(), true)
            ->setIssuedAt(time())
            ->set('uid', $user['id'])
            ->sign($this->signer,  $this->privateKey)
            ->getToken();
        return $token->__toString();
    }

    public function create_planter_token($user_id, $planter_id) {
        $token = (new Lcobucci\JWT\Builder())->setIssuer($this->origin())
            ->setAudience($this->origin())
            ->setId($user_id . "_" . time(), true)
            ->setIssuedAt(time())
            ->set('uid', $user_id)
            ->set('pid', $planter_id)
            ->sign($this->signer,  $this->privateKey)
            ->getToken();
        return $token->__toString();
    }

    public function verify($token_string) {
        $token = (new Lcobucci\JWT\Parser())->parse((string) $token_string);
        return $token->verify($this->signer, $this->publicKey);
    }

    public function token($token_string) {
        return (new Lcobucci\JWT\Parser())->parse((string) $token_string);
    }
}
?>

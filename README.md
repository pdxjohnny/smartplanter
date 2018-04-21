# Smart Planter PWA Client

IoT Smart Planter PWA Client

## Setup

```console
git clone git@github.com:pdxjohnny/smartplanter --recursive
cd smartplanter
python3 -m http.server 1234 || python2 -m SimpleHTTPServer 1234
```

## Favicons

Generated with [RealFaviconGenerator](https://realfavicongenerator.net/)

## Force HTTPS with htaccess

```console
cat > .htaccess <<'EOF'
RewriteEngine On
RewriteCond %{HTTPS} !=on
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
EOF
```

## API

### Create User

Endpoint returns a JSON with user ID and a JWT which should be used in the
Authorization header.

```console
curl 'https://web.cecs.pdx.edu/~jsa3/smartplanter/api/createuser/?password=test'
# export TOKEN=`result of token in the above JSON reponse`
```

### Login

```console
curl 'https://web.cecs.pdx.edu/~jsa3/smartplanter/api/login/?id=42&password=test'
# export TOKEN=`result of token in the above JSON reponse`
```

### Set Resource

```console
curl -H "Authorization: Bearer $TOKEN" \
  -d 'Hello World'
  'https://web.cecs.pdx.edu/~jsa3/smartplanter/api/sync/?resource=test'
```

### Get Resource

```console
curl -H "Authorization: Bearer $TOKEN" \
  'https://web.cecs.pdx.edu/~jsa3/smartplanter/api/sync/?resource=test'
```

You should see `Hello World`

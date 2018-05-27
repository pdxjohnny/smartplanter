# Smart Planter PWA Client

IoT Smart Planter PWA Client

## Setup

```console
cd ~/public_html/
git clone git@github.com:pdxjohnny/smartplanter --recursive
cd smartplanter
./scripts/setup.sh
```

## VAPID Keys for Push Notifications

These are currently committed to the repo. To re-generate run the create-vapid
script.

Keys are only committed to the repo now because storage of them in a secure way
would be complex to manage. Under no circumstances should they become publicly
available. If this application is to become production ready they must be stored
in a secure location and deployment should account for their retrieval at time
of application stand up.

```console
./scripts/create-vapid
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

### Create Resource

```console
curl -H "Authorization: Bearer $TOKEN" \
  -d 'Hello World'
  'https://web.cecs.pdx.edu/~jsa3/smartplanter/api/sync/'
```

### Update Resource

```console
curl -X PUT \
  -H "Authorization: Bearer $TOKEN" \
  -d 'Hello World'
  'https://web.cecs.pdx.edu/~jsa3/smartplanter/api/sync/?resource=<created ID>'
```

### Get Resource

```console
curl -H "Authorization: Bearer $TOKEN" \
  'https://web.cecs.pdx.edu/~jsa3/smartplanter/api/sync/?resource=<created ID>'
```

You should see `Hello World`

### Create Planter

```console
curl -H "Authorization: Bearer $TOKEN" \
  'https://web.cecs.pdx.edu/~jsa3/smartplanter/api/createplanter/'
# export PTOKEN=`result of token in the above JSON reponse`
```

### Update Planter

```console
curl -X PUT \
  -H "Authorization: Bearer $PTOKEN" \
  -d 'Hello World'
  'https://web.cecs.pdx.edu/~jsa3/smartplanter/api/sync/'
```

### Get Planter

```console
curl -H "Authorization: Bearer $PTOKEN" \
  'https://web.cecs.pdx.edu/~jsa3/smartplanter/api/sync/'
```

## TODO

- Calendar needs to predict from last watered day, now supplied by planter.
- Push notifications (WebPush incompatibility with php 7.0 only compatible with
  7.1 and above, fork and fix)
- Offline compatibility (All libs use fetch and the mixed content hack doesn't
  work with that)
- UX Improvements, notification of planter received changes

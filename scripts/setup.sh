#!/bin/bash
set -e
set -x

./scripts/token-keygen
./scripts/composer-install
cd api
php ../composer.phar install
cd ..
chmod 755 .
find . -type f -name \*.js -exec chmod -v 644 {} \;
find . -type f -name \*.css -exec chmod -v 644 {} \;
find . -type f -name \*.html -exec chmod -v 644 {} \;
find . -type d -not -path './api/vendor/*' \
  -not -path './.git' \
  -not -path './.git/*' \
  -exec chmod -v 755 {} \;

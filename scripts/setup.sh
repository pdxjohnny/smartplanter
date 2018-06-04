#!/bin/bash
set -e
set -x

npm install
cd dist/
../scripts/token-keygen
../scripts/composer-install
cd api
php ../composer.phar install
cd ..
chmod 755 .
find icons -type f -exec chmod -v 644 {} \;
find . -type f -name \*.js -exec chmod -v 644 {} \;
find . -type f -name \*.css -exec chmod -v 644 {} \;
find . -type f -name \*.html -exec chmod -v 644 {} \;
find . -type f -not -path './api/vendor/*' -name \*.php -exec chmod -v 755 {} \;
find . -type d -not -path './api/vendor/*' -exec chmod -v 755 {} \;
cd ..
npm run webpack
ln -s $PWD/dist/ ~/public_html/smartplanter/

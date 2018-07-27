FROM php:7-apache AS web
ENV http_proxy http://proxy.jf.intel.com:911
ENV https_proxy http://proxy.jf.intel.com:912

COPY composer.json /var/www/

RUN docker-php-ext-install -j$(($(nproc) + 1)) pdo_mysql && \
    chown -R www-data:www-data /var/www && \
    cd /var/www && \
    apt-get -y update && \
    apt-get -y install git && \
    su -s /bin/bash www-data \
      -c 'curl -sS https://getcomposer.org/installer | php' && \
    su -s /bin/bash www-data \
      -c 'php composer.phar install' && \
    apt-get -y purge git && \
    apt-get -y autoremove && \
    rm -rf /var/lib/apt/lists/* && \
    rm composer.phar


FROM node:8 AS js

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
RUN npm config set proxy http://proxy.jf.intel.com:911 && \
  npm config set https-proxy http://proxy.jf.intel.com:912
COPY package.json .
COPY package-lock.json .
RUN npm install

COPY . .
RUN npm run webpack && \
  pwd && \
  ls -lAF

FROM web
COPY --from=js /usr/src/app/dist /var/www/html

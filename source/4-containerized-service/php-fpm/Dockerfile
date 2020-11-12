FROM php:7.3-fpm-stretch
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"
RUN docker-php-ext-install -j$(nproc) pdo pdo_mysql
COPY / /var/www/html/
RUN chown -R www-data:www-data /var/www/html
RUN apt-get update
RUN apt-get install zip -y
RUN php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
RUN php composer-setup.php
RUN php -r "unlink('composer-setup.php');"
RUN php composer.phar install
EXPOSE 9000
CMD ["php-fpm"]

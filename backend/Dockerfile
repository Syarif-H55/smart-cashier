FROM php:8.2-apache
WORKDIR /var/www/html
COPY src/ /var/www/html/
EXPOSE 80

# Instal ekstensi mysqli untuk koneksi MySQL
RUN docker-php-ext-install mysqli && docker-php-ext-enable mysqli

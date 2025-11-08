FROM php:8.1-apache

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_mysql

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Copy application files
COPY . /var/www/html/
COPY src/ /var/www/html/src/

# Set working directory
WORKDIR /var/www/html

# Install Composer (if needed)
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Change document root for Apache
ENV APACHE_DOCUMENT_ROOT /var/www/html/src
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/000-default.conf

# Enable .htaccess override and set up directory permissions
RUN sed -ri -e '/<Directory/,$!b;//!b;N;s/AllowOverride None/AllowOverride All/g' /etc/apache2/sites-available/000-default.conf

# Create .htaccess file for API routing in src directory
RUN echo "RewriteEngine On\nRewriteCond %{REQUEST_URI} ^/api/\nRewriteRule ^(.*)$ /index.php [QSA,L]\nRewriteCond %{REQUEST_FILENAME} !-f\nRewriteCond %{REQUEST_FILENAME} !-d\nRewriteRule ^(.*)$ /index.php [QSA,L]" > /var/www/html/src/.htaccess

# Set proper permissions
RUN chown -R www-data:www-data /var/www/html

EXPOSE 80

CMD ["apache2-foreground"]
# Use official PHP 8.2-FPM image as base
FROM php:8.2-fpm
# Set working directory inside the container
WORKDIR /var/www/html

# Install Composer globally
RUN echo "Install composer"
COPY --from=composer:latest /usr/bin/composer /usr/local/bin/composer

# Install Laravel dependencies
COPY ../backend/ ./
RUN composer install

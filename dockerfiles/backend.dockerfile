# Use official PHP 8.2-FPM image as base
FROM php:8.2-fpm-alpine

# Set working directory inside the container
WORKDIR /var/www/html

# Set default UID and GID
ARG UID=1000
ARG GID=1000

# Install system packages and create user
RUN apk add --no-cache \
  bash \
  curl \
  git \
  unzip \
  autoconf \
  gcc \
  g++ \
  make \
  libpng-dev \
  libjpeg-turbo-dev \
  freetype-dev \
  libzip-dev \
  postgresql-dev \
  oniguruma-dev \
  && addgroup -g ${GID} laravel \
  && adduser -u ${UID} -G laravel -s /bin/bash -D laravel

# Configure and install GD extension
RUN docker-php-ext-configure gd --with-freetype --with-jpeg
RUN docker-php-ext-install -j$(nproc) gd

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_mysql pdo_pgsql mbstring zip exif pcntl

# Install Redis extension
RUN pecl install redis && docker-php-ext-enable redis


# Install Composer globally
RUN echo "Install composer"
COPY --from=composer:latest /usr/bin/composer /usr/local/bin/composer

# Install Laravel dependencies
COPY backend/ ./
RUN composer install

# Set up cron job
# COPY ./dockerfiles/cronjobs /etc/cron.d/laravel-cron
# RUN chmod 0644 /etc/cron.d/laravel-cron
# RUN crontab /etc/cron.d/laravel-cron

# RUN echo "* * * * * php artisan schedule:run >> /dev/null 2>&1" | crontab -

# CMD ["service", "rsyslog", "start", "&& cron", "-f"]
EXPOSE 9000

CMD ["php-fpm", "-y", "/usr/local/etc/php-fpm.conf", "-R"]
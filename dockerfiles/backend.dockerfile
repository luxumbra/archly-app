# Use official PHP 8.2-FPM image as base
FROM php:8.2-fpm

# Set working directory inside the container
WORKDIR /var/www/html

RUN if ! getent group laravel > /dev/null 2>&1; then \
    addgroup --gid ${GID} --system laravel; \
  fi \
  && if ! id -u laravel > /dev/null 2>&1; then \
    adduser --system --no-create-home --uid ${UID} --ingroup laravel --shell /bin/sh laravel; \
  fi \
  && chown -R laravel:laravel /var/www/html \
  && chmod -R 755 /var/www/html


# Check if redis is installed, and install if not
RUN if ! php -m | grep -q 'redis'; then \
  pecl install redis && docker-php-ext-enable redis; \
  fi

RUN apt-get update && apt-get install -y cron rsyslog net-tools \
  build-essential \
  libpng-dev \
  libjpeg-dev \
  libfreetype6-dev \
  locales \
  zip \
  jpegoptim optipng pngquant gifsicle \
  vim \
  unzip \
  git \
  curl \
  libzip-dev \
  libpq-dev \
  libonig-dev \
  && docker-php-ext-configure gd --with-freetype --with-jpeg \
  && docker-php-ext-install -j$(nproc) gd

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_mysql pdo_pgsql mbstring zip exif pcntl

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Composer globally
RUN echo "Install composer"
COPY --from=composer:latest /usr/bin/composer /usr/local/bin/composer

# Install Laravel dependencies
COPY ../backend/ ./
RUN composer install

# Set up cron job
# COPY ./dockerfiles/cronjobs /etc/cron.d/laravel-cron
# RUN chmod 0644 /etc/cron.d/laravel-cron
# RUN crontab /etc/cron.d/laravel-cron

# RUN echo "* * * * * php artisan schedule:run >> /dev/null 2>&1" | crontab -

# CMD ["service", "rsyslog", "start", "&& cron", "-f"]
EXPOSE 9000

CMD ["php-fpm", "-y", "/usr/local/etc/php-fpm.conf", "-R"]
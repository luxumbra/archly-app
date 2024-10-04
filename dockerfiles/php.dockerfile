FROM php:8.2-fpm

ARG UID
ARG GID

ENV UID=${UID}
ENV GID=${GID}

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

# Update & install required packages
RUN apt-get update && apt-get install -y \
  curl \
  libxml2-dev \
  libzip-dev \
  unzip \
  zip \
  libpng-dev \
  libjpeg-dev \
  libonig-dev \
  libcurl4-openssl-dev \
  libfreetype6-dev \
  libpq-dev \
  libssl-dev

# RUN apt-get clean && rm -rf /var/lib/apt/lists/*


RUN docker-php-ext-install pgsql pdo pdo_pgsql mbstring exif zip soap pcntl bcmath curl zip opcache \
  && docker-php-ext-configure gd --enable-gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) gd

# Set up cron to run Laravel's schedule:run command every minute

EXPOSE 9000

CMD ["php-fpm", "-y", "/usr/local/etc/php-fpm.conf", "-R"]

FROM php:8.2-fpm

ARG UID
ARG GID

ENV UID=${UID}
ENV GID=${GID}

WORKDIR /var/www/html

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

  # Install SOAP using PECL
# RUN pecl install soap \
#   && docker-php-ext-enable soap


RUN docker-php-ext-install pgsql pdo pdo_pgsql mbstring exif zip soap pcntl bcmath curl zip opcache

RUN docker-php-ext-configure gd --enable-gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) gd


# Install Redis using PECL
# RUN pecl install redis \
#     && docker-php-ext-enable redis
# RUN mkdir -p /usr/src/php/ext/redis \
#     && curl -L https://github.com/phpredis/phpredis/archive/6.0.2.tar.gz | tar xvz -C /usr/src/php/ext/redis --strip 1 \
#     && echo 'redis' >> /usr/src/php-available-exts \
#     && docker-php-ext-install redis


EXPOSE 9000

CMD ["php-fpm", "-y", "/usr/local/etc/php-fpm.conf", "-R"]

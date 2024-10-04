FROM nginx:stable-alpine

ARG UID
ARG GID

ENV UID=${UID}
ENV GID=${GID}

RUN mkdir -p /var/www/html

WORKDIR /var/www/html

ADD dockerfiles/nginx/default.conf /etc/nginx/conf.d/default.conf
ADD dockerfiles/nginx/snippets/fastcgi-php.conf /etc/nginx/conf.d/snippets/fastcgi-php.conf


RUN if ! getent group laravel > /dev/null 2>&1; then \
    addgroup --gid ${GID} --system laravel; \
  fi \
  && if ! id -u laravel > /dev/null 2>&1; then \
    adduser --system --no-create-home --uid ${UID} --ingroup laravel --shell /bin/sh laravel; \
  fi \
  && sed -i "s/user nginx/user laravel/g" /etc/nginx/nginx.conf \
  && chown -R laravel:laravel /var/www/html \
  && chmod -R 755 /var/www/html

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
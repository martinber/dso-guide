FROM alpine

# Based on https://github.com/hellt/nginx-uwsgi-flask-alpine-docker

COPY ./config/requirements.txt /tmp/requirements.txt

RUN apk add --no-cache python3 bash nginx uwsgi uwsgi-python3 supervisor \
    && python3 -m ensurepip \
    && rm -r /usr/lib/python*/ensurepip \
    && pip3 install --upgrade pip setuptools \
    && pip3 install -r /tmp/requirements.txt \
    && rm /etc/nginx/conf.d/default.conf \
    && rm -r /root/.cache

COPY ./config/nginx.conf /etc/nginx/
COPY ./config/flask-site-nginx.conf /etc/nginx/conf.d/
COPY ./config/supervisord.conf /etc/supervisord.conf

# Copy the base uWSGI ini file to enable default dynamic uwsgi process number
COPY ./config/uwsgi.ini /etc/uwsgi/

COPY ./app /app
WORKDIR /app
RUN chown -R nginx:nginx /app

ENV DSO_DB_PATH="/app/deepsky.db"
ENV DSO_LOG_PATH="/app/dso-guide.log"

CMD ["/usr/bin/supervisord"]

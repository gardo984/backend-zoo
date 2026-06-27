
FROM python:3.12-alpine AS app-base

ENV APP_DIR=/usr/src/backend
ENV PROJECT_NAME=app
WORKDIR ${APP_DIR}
ARG UID
RUN adduser --disabled-password -u ${UID} -s /bin/ash app && \
	chown app:app ${APP_DIR}

COPY --chown=app app ./${PROJECT_NAME}
COPY --chown=app alembic ./alembic
COPY --chown=app alembic.ini ./alembic.ini
COPY --chown=app tests ./tests
COPY --chown=app requirements.txt ./requirements.txt
COPY --chown=app alembic.ini ./alembic.ini
COPY --chown=app cli.py ./cli.py
COPY --chown=app bin/entrypoint.sh ./entrypoint.sh
COPY --chown=app bin/wait-for-it.sh ./wait-for-it.sh

## install sudoers and enable sudo without password prompt

RUN chmod +x ./entrypoint.sh ./wait-for-it.sh && \
	apk add sudo && \
	sed -e 's/^# \(%wheel.*NOPASSWD*\)/\1/g' -i /etc/sudoers && \
	addgroup app wheel && \
	apk add -u gcc musl-dev postgresql-client \
				mariadb-client mariadb-dev mariadb-connector-c-dev \
				libffi-dev curl && \
	mkdir -p /var/log/gunicorn/ && \
	chown app:app /var/log/gunicorn/

ENV PATH="${PATH}:/home/app/.local/bin"

## install python pandas and additional packages

WORKDIR ${APP_DIR}/${PROJECT_NAME}
RUN for x in $(echo "main community testing"); \
	do echo "https://dl-cdn.alpinelinux.org/alpine/edge/${x}" >> /etc/apk/repositories; \
	done && \
	apk update && \
	apk add py3-pandas && \
	pip3 install --upgrade pip 

# pip3 install poetry

USER app
WORKDIR ${APP_DIR}
ENV PYTHONPATH="/usr/lib/python3.12/site-packages/"


## target: develop

FROM app-base AS dev
USER root
RUN pip install -r requirements.txt
USER app

EXPOSE 8001
ENTRYPOINT ["./entrypoint.sh"]
CMD ["deploy"]


## target: production

FROM app-base AS prod
USER root
RUN pip install -r requirements.txt
USER app

EXPOSE 8001
ENTRYPOINT ["./entrypoint.sh"]
CMD ["deploy"]

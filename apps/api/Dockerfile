FROM python:3.12-slim

WORKDIR /service
COPY pyproject.toml .
COPY app ./app
COPY alembic.ini .
COPY alembic ./alembic
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN pip install --no-cache-dir . \
    && chmod +x /docker-entrypoint.sh

EXPOSE 8000
ENTRYPOINT ["/docker-entrypoint.sh"]

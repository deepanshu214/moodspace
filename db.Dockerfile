FROM postgres:16-bullseye

RUN apt-get update && apt-get install -y \
    postgresql-16-postgis-3 \
    postgresql-16-postgis-3-scripts \
    build-essential \
    postgresql-server-dev-16 \
    git \
    && rm -rf /var/lib/apt/lists/*

RUN cd /tmp && \
    git clone --branch v0.6.2 https://github.com/pgvector/pgvector.git && \
    cd pgvector && \
    make && \
    make install && \
    rm -rf /tmp/pgvector

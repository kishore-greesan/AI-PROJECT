#!/bin/bash
set -e
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    CREATE DATABASE authdb;
    CREATE DATABASE product;
    CREATE DATABASE warehousedb;
    CREATE DATABASE ordersdb;
    CREATE DATABASE alertdb;
    CREATE DATABASE reportdb;
EOSQL
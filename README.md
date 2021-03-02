# hiveos-datacollector

[![GitHub issues](https://img.shields.io/github/issues/entmike/hiveos-datacollector.svg)](https://github.com/entmike/hiveos-datacollector/issues)
[![Docker Pulls](https://img.shields.io/docker/pulls/entmike/hiveos-datacollector.svg)](https://hub.docker.com/r/entmike/hiveos-datacollector/)
[![Automated Build](https://img.shields.io/docker/cloud/automated/entmike/hiveos-datacollector.svg)](https://hub.docker.com/r/entmike/hiveos-datacollector/)

Pull GPU stats from HiveOS and populate a PostgreSQL DB table

# Try it Now with Docker
If you don't care about local development and just want to run it, see the example below.

## Pre-requisites:

1. Docker Installed
2. PostgreSQL Installed somewhere (physical host, VM, Docker, whatever) with a new DB created (i.e. `hubitat`)
3. `hiveos_stats` table created in PostgreSQL DB.  Create statement for your convenience:
```sql
CREATE TABLE hiveos_stats (
    farmid integer NOT NULL,
    workerid integer NOT NULL,
    timestamp timestamp without time zone NOT NULL DEFAULT now(),
    bus_id character varying(32) NOT NULL,
    bus_number integer NOT NULL,
    temp integer,
    power integer,
    fan integer,
    is_overheated boolean,
    hash double precision
);
```

## Example:
```
docker run --rm -ti \
  -e PGHOST=yourpostgreshost -e PGPORT=5432 -e PGDATABASE=hubitat -e PGUSER=postgres -e PGPASSWORD=YourPassword \
  -e INTERVAL=600 -e HIVEOS_TOKEN=yourhiveosapitoken entmike/hiveos-datacollector
```

Environment Variables:
|Variable|Description|Default Value|
|---|---|---|
|`PGHOST`|PostgreSQL Host|Empty|
|`PGPORT`|PostgreSQL Port|`5432`|
|`PGDATABASE`|PostgreSQL Database Name|Empty|
|`PGUSER`|PostgreSQL User|Empty|
|`PGPASSWORD`|PostgreSQL Password|Empty|
|`INTERVAL`|HiveOS Refresh Interval (seconds)|`600`|
|`HIVEOS_TOKEN`|Your HiveOS API Token||


In `psql` or whatever PostgreSQL client you use, connect to the database and look at the `hiveos_stats` table for updates.

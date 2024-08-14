#!/usr/bin/env zsh

# credit: https://github.com/grafana/xk6-output-influxdb

set -e

if [ $# -ne 1 ]; then
  echo "Usage: ./run.sh <SCRIPT_NAME>"
  exit 1
fi

SCRIPT_NAME=$1
TAG_NAME="$(basename -s .js $SCRIPT_NAME)-$(date +%s)"

docker compose run --rm -T k6 run -<$SCRIPT_NAME --tag testid=$TAG_NAME

#!/usr/bin/env zsh

RUNNING_CONTAINER_NAME="app"
OUTPUT_FILE="./output/memusage.txt"
while docker inspect --format '{{.State.Running}}' "$RUNNING_CONTAINER_NAME" &> /dev/null; do
  docker stats --no-stream | grep $RUNNING_CONTAINER_NAME | awk -v date="$(date +%T)" '{print date, $4}' | sed -e 's/MiB//g' >> $OUTPUT_FILE;
done

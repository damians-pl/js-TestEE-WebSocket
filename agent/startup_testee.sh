#!/bin/bash

start() {
  forever start /home/ec2-user/js-TestEE-WebSocket/agent/agent.js
}

stop() {
  forever stop /home/ec2-user/js-TestEE-WebSocket/agent/agent.js
}

case "$1" in
  start)
    start
    ;;
  stop)
    stop
    ;;
  restart)
    stop
    start
    ;;
  *)
    echo "Usage: $0 {start|stop|restart}" >&2
    exit 1
    ;;
esac
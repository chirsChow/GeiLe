#!/bin/sh
name=$1
if [ -d "component/${name}" ]; then
  echo "********Delete module********"
  rm -rf component/${name}
  sed -i "s/'starter.${name}',//g" config.js
fi

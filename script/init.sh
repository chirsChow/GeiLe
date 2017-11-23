#!/bin/sh
touch config.js
echo -n "var myapp = angular.module('starter', ['ionic','starter.services','toast'" > config.js
dir=$(ls -l ./component/ |awk '/^d/ {print $NF}')
for i in $dir
do
    echo -n ",'starter.$i'" >> config.js
done   

echo "]);" >> config.js
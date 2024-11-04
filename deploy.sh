#!/bin/sh
tdir=$(mktemp -d)
docker build -t chatbot-demo-docker .
docker save -o $tdir/whai.tar chatbot-demo-docker
scp $tdir/whai.tar zincadm@whai.znsrv.com:/tmp/whai.tar
ssh zincadm@whai.znsrv.com docker load -i /tmp/whai.tar \&\& rm /tmp/whai.tar \&\& ./run.sh

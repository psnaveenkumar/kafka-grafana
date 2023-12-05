#!/bin/sh
 
set -e

mage build:backend 
pnpm run build 
sudo systemctl stop grafana-server
sudo rm -rf /var/lib/grafana/plugins
sudo cp dist -r /var/lib/grafana/plugins


GF_DEFAULT_APP_MODE=development sudo systemctl start grafana-server

echo "started"
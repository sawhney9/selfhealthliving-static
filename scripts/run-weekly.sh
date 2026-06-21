#!/bin/bash
# Weekly content generation — runs automatically via crontab
# Logs to /tmp/shl-generate.log

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

cd "/Users/rimas/Documents/antigravity/SHL Website"
echo "=== SHL Generate $(date) ===" >> /tmp/shl-generate.log
node --env-file=.env scripts/generate-weekly.js >> /tmp/shl-generate.log 2>&1

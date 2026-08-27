#!/bin/bash
set -ex

# Convenience workspace directory for later use
WORKSPACE_DIR=$(pwd)

sudo npm install --global npm@12
test "$(node --version | cut -d. -f1 | tr -d v)" = "24"
test "$(npm --version | cut -d. -f1)" = "12"
npm ci

#!/bin/bash
#Generates a commitish string for climate explorer and stores it in 
# the CE_CURRENT_VERSION environment variable.

VERSIONTAG="$(git describe --tags --abbrev=0)"
BRANCH="$(git rev-parse --abbrev-ref HEAD)"
COMMITSHA="$(git log -1 --format=%h)"

echo "$VERSIONTAG ($BRANCH: $COMMITSHA)"
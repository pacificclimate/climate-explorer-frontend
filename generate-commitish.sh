#!/bin/bash
#Generates a commitish string for climate explorer

VERSIONTAG="$(git describe --tags --abbrev=0)"
BRANCH="$(git rev-parse --abbrev-ref HEAD)"
COMMITSHA="$(git log -1 --format=%h)"

echo "$VERSIONTAG ($BRANCH: $COMMITSHA)"

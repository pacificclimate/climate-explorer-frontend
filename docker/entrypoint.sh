#!/bin/bash

# Note: this pulls the public url by a combination of grep and cut and relies on 
# PUBLIC_URL to be on its own line with the value and in the format of PUBLIC_URL="http://localhost:8080"
# Fragile to additional quotes due to us looking for index 2
PUBLIC_URL=$(grep PUBLIC_URL config.js | cut -d'"' -f 2)

# update static files with the public url
rpl -iR \
    -x **/*.js \
    -x **/*.html \
    -x **/*.css \
    -x **/*.json \
    "%REPLACE_PUBLIC_URL%" $PUBLIC_URL .

# It is possible that the above could be replaced by a node.js based
# script which may prove more resillient long term 

serve -s . -l 8080

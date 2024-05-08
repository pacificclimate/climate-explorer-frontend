#!/bin/bash
set -ex

##
## Create some aliases
##
echo 'alias ll="ls -alF"' >> $HOME/.bashrc
echo 'alias la="ls -A"' >> $HOME/.bashrc
echo 'alias l="ls -CF"' >> $HOME/.bashrc

## used for user documentation
pip install docutils

# Convenience workspace directory for later use
WORKSPACE_DIR=$(pwd)


echo "Done!"

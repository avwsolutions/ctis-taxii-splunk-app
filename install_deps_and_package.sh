#!/usr/bin/env bash
set -xe
working_dir=$(pwd)
pip install -r dev-requirements.txt

pip freeze # for debugging purposes

# Install splunk-ui project dependencies & run initial build
cd splunkui
yarn setup

cd "$working_dir"
cd integration_test && ./package.sh


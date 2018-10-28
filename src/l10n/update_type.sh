#!/bin/bash

## Summary:
## This script automatically generates the flow type for localization and saves it into 'type.js'.
## You should rerun this script every time you change structure of localization data.
## 
## Usage:
## (cd this directory) && ./update_type.sh
##
## Details:
## The script imports en.js structure, extracts the default export out of it
## and transforms it into a Flow type, currently supporting strings and functions.

cd "$(dirname ${BASH_SOURCE[0]})/../.."

npx babel-node src/l10n/update_l10n.js \
  | sed 's/"//g' `# remove quotes from keys and values` \
  | sed -E "s/ ([0-9]+)/'\\1'/" `# unstrip qoutes on numeric-only keys`\
  > src/l10n/type.js
yarn prettify_l10n

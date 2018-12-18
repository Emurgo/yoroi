#!/bin/bash

## Summary:
##
## This script automatically generates ios system translations files from
## application translations.
## You should run this script everytime ios translation are changed.
##
## Details:
## Script creates localization folder and generates new 'InfoPlist.strings' file
## with messages stored under 'global.ios' key for each supported language.
## Language is ommited if translations were not found.

npx babel-node src/l10n/updateIOSSystemTranslations.js

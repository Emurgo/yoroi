#!/usr/bin/env ruby

require 'fastlane'

# Set up API key
api_key = app_store_connect_api_key(
  key_id: ENV['APP_STORE_KEY_ID'] || 'PH9Z89M567',
  issuer_id: ENV['APP_STORE_ISSUER_ID'] || 'feff08c0-5259-4e9a-bdbe-26cdb046e1d5',
  key_filepath: ENV['APP_STORE_KEY_PATH'] || "#{ENV['HOME']}/.yoroi/ios/AuthKey_PH9Z89M567.p8",
  duration: 1200,
  in_house: false
)

# Upload to TestFlight
upload_to_testflight(
  api_key: api_key,
  ipa: "../dist/ios/nightly/yoroi.ipa",
  app_identifier: ENV["APP_STORE_BUNDLE_ID"] || "com.emurgo.yoroi-nightly",
  skip_waiting_for_build_processing: true
)

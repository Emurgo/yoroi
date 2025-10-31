/**
 * Expo Config Plugin for Firebase Cloud Messaging
 * This plugin configures both Android and iOS for Firebase integration
 */

const {
  withProjectBuildGradle,
  withAppBuildGradle,
  withXcodeProject,
} = require('@expo/config-plugins')
const fs = require('fs')
const path = require('path')

/**
 * Adds Firebase configuration to Android
 */
function withFirebaseAndroid(config) {
  config = withProjectBuildGradle(config, (config) => {
    const {modResults} = config
    let contents = modResults.contents

    if (!contents.includes('com.google.gms:google-services')) {
      const dependenciesRegex = /dependencies\s*{/
      contents = contents.replace(
        dependenciesRegex,
        `dependencies {
        classpath 'com.google.gms:google-services:4.4.0'`,
      )

      modResults.contents = contents
    }

    return config
  })

  config = withAppBuildGradle(config, (config) => {
    const {modResults} = config
    let contents = modResults.contents

    if (!contents.includes('com.google.gms.google-services')) {
      // Add after the application plugin
      const applicationPluginRegex =
        /apply plugin:\s*["']com\.android\.application["']/
      contents = contents.replace(
        applicationPluginRegex,
        `apply plugin: "com.android.application"
apply plugin: "com.google.gms.google-services"`,
      )

      modResults.contents = contents
    }

    return config
  })

  return config
}

/**
 * Adds Firebase configuration to iOS
 */
function withFirebaseIOS(config) {
  config = withXcodeProject(config, async (config) => {
    const {modRequest} = config
    const {platformProjectRoot, projectName, projectRoot} = modRequest

    if (!platformProjectRoot || !projectName) {
      return config
    }

    // Path where the plist should be copied in the iOS project
    const targetPlistPath = path.join(
      platformProjectRoot,
      projectName,
      'GoogleService-Info.plist',
    )

    // Source path of the plist file (should be in the mobile root directory)
    const sourcePlistPath = path.join(projectRoot, 'GoogleService-Info.plist')

    if (fs.existsSync(sourcePlistPath)) {
      try {
        const targetDir = path.dirname(targetPlistPath)
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, {recursive: true})
        }

        fs.copyFileSync(sourcePlistPath, targetPlistPath)
        console.log('✅ GoogleService-Info.plist copied to iOS project')

        const xcodeProject = config.modResults
        if (xcodeProject && xcodeProject.addResourceFile) {
          xcodeProject.addResourceFile('GoogleService-Info.plist', {
            target: xcodeProject.getFirstTarget().uuid,
          })
        }
      } catch (error) {
        console.warn(
          '⚠️  Failed to copy GoogleService-Info.plist:',
          error.message,
        )
      }
    } else {
      console.warn(
        '⚠️  GoogleService-Info.plist not found at:',
        sourcePlistPath,
        '\nPlease add this file to enable Firebase on iOS.',
      )
    }

    return config
  })

  return config
}

/**
 * Main plugin function
 */
const withFirebase = (config) => {
  console.log('Configuring Firebase for Android and iOS...')

  config = withFirebaseAndroid(config)

  config = withFirebaseIOS(config)

  console.log(' Firebase configuration complete')

  return config
}

module.exports = withFirebase

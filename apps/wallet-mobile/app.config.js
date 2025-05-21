export default {
  name: 'yoroi',
  displayName: 'Yoroi',
  expo: {
    name: 'yoroi',
    slug: 'yoroi',
    plugins: [
      'sentry-expo',
      [
        'expo-build-properties',
        {
          ios: {
            useFrameworks: 'static'
          }
        }
      ]
    ],
    sdkVersion: '48.0.0',
    entryPoint: '.vscode/exponentIndex.js',
    ios: {
      infoPlist: {
        UIBackgroundModes: ['fetch', 'remote-notification']
      },
      'expo-build-properties': {
        ios: {
          deploymentTarget: '14.0'
        }
      }
    }
  }
}; 
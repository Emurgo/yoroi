import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import WebView from 'react-native-webview'

export const BrowserView = () => {
  const {styles} = useStyles()

  return (
    <SafeAreaView style={styles.root}>
      <WebView
        androidLayerType="software"
        source={{uri: 'https://www.google.com'}}
        // onMessage={(event) => handleOnMessage(event)}
      />
    </SafeAreaView>
  )
}

const useStyles = () => {
  const {theme} = useTheme()

  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.color['white-static'],
    },
  })

  return {styles} as const
}

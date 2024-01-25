import React, {LegacyRef, useRef} from 'react'

import {WebView} from 'react-native-webview'
import {StatusBar} from '../components'
import {Text, TouchableOpacity, View, StyleSheet, Share, Platform} from 'react-native'

const DAPP_URL = 'https://app.dexhunter.io/'

export const Nfts = () => {
  const ref = useRef<WebView | null>(null)

  const handleReloadPress = () => {
    ref.current?.reload()
  }

  const handleBackPress = () => {
    ref.current?.goBack()
  }

  const handleForwardPress = () => {
    ref.current?.goForward()
  }

  const handleSharePress = () => {
    if (Platform.OS === 'android') {
      Share.share({message: DAPP_URL})
    } else {
      Share.share({url: DAPP_URL})
    }
  }

  return (
    <View style={{flex: 1}}>
      <StatusBar type="dark" />
      <View style={styles.navigationContainer}>
        <TouchableOpacity onPress={handleReloadPress} style={styles.navigationButton}>
          <Text>Reload</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleBackPress} style={styles.navigationButton}>
          <Text>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleForwardPress} style={styles.navigationButton}>
          <Text>Forward</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSharePress} style={styles.navigationButton}>
          <Text>Share</Text>
        </TouchableOpacity>
      </View>
      <WebView source={{uri: DAPP_URL}} ref={ref} />
    </View>
  )
}

const styles = StyleSheet.create({
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  navigationButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 50,
    backgroundColor: '#ccc',
    borderRadius: 10,
    overflow: 'hidden',
  },
})

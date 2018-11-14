// @flow
import React from 'react'
import {View, StyleSheet} from 'react-native'

import Text from './Text'

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#F0F3F5',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerError: {
    backgroundColor: '#FF1351dd',
  },
  label: {
    marginBottom: 6,
  },
})

type Props = {
  text: string,
  label?: string,
  error?: boolean,
}

const Banner = ({error, text, label}: Props) => (
  <View style={[styles.banner, error && styles.bannerError]}>
    {!!label && (
      <Text light={error} secondary style={styles.label}>
        {label}
      </Text>
    )}
    <Text light={error}>
      You are offline. Please check settings on your device.
    </Text>
  </View>
)

export default Banner

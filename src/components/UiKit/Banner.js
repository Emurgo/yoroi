// @flow
import * as React from 'react'
import {View, StyleSheet} from 'react-native'

import Text from './Text'

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#F0F3F5',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textError: {
    color: '#FF1351',
  },
  label: {
    marginBottom: 6,
  },
})

type Props = {|
  text: string,
  label?: string,
  error?: boolean,
  children?: React.Node,
|}

const Banner = ({error, text, label, children}: Props) => (
  <View style={styles.banner}>
    {!!label && (
      <Text light={error} secondary small style={styles.label}>
        {label}
      </Text>
    )}
    <Text style={[error && styles.textError]}>{text}</Text>
    {children}
  </View>
)

export default Banner

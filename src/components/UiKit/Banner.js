// @flow
import * as React from 'react'
import {View} from 'react-native'

import Text from './Text'

import styles from './styles/Banner.style'

type Props = {|
  text: string,
  boldText?: boolean,
  label?: string,
  error?: boolean,
  children?: React.Node,
|}

const Banner = ({error, text, boldText, label, children}: Props) => (
  <View style={styles.banner}>
    {!!label && (
      <Text light={error} small style={styles.label}>
        {label}
      </Text>
    )}
    <Text style={[boldText && styles.bold, error && styles.textError]}>
      {text}
    </Text>
    {children}
  </View>
)

export default Banner

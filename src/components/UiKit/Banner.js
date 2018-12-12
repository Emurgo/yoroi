// @flow
import * as React from 'react'
import {View, TouchableOpacity} from 'react-native'

import Text from './Text'

import styles from './styles/Banner.style'

type Props = {|
  text?: string,
  boldText?: boolean,
  label?: string,
  error?: boolean,
  children?: React.Node,
|}

const Banner = ({error, text, boldText, label, children}: Props) => (
  <View style={[styles.banner, error && styles.bannerError]}>
    {!!label && (
      <Text error={error} small style={styles.label}>
        {label}
      </Text>
    )}
    {!!text && (
      <Text small={error} bold={boldText} style={[error && styles.textError]}>
        {text}
      </Text>
    )}
    {children}
  </View>
)

type ClickableProps = {|
  ...Props,
  onPress?: () => any,
|}

const ClickableBanner = ({onPress, ...rest}: ClickableProps) =>
  onPress ? (
    <TouchableOpacity
      onPress={onPress}
      hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
    >
      <Banner {...rest} />
    </TouchableOpacity>
  ) : (
    <Banner {...rest} />
  )

export default ClickableBanner

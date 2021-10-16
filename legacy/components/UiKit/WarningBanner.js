// @flow

import React from 'react'
import {Image, TouchableOpacity, View} from 'react-native'

import closeIcon from '../../assets/img/close.png'
import {Button, Text} from '.'
import styles from './styles/WarningBanner.style'

type Props = {|
  title: string,
  icon: ?number,
  message: string,
  buttonTitle?: string,
  action?: (event?: any) => mixed,
  showCloseIcon?: boolean,
  onRequestClose?: (any) => any,
  style?: Object,
|}

export const WarningBanner = ({
  title,
  icon,
  message,
  buttonTitle,
  action,
  showCloseIcon,
  onRequestClose,
  style,
}: Props) => (
  <View style={[styles.wrapper, style]}>
    {showCloseIcon === true && (
      <TouchableOpacity style={styles.close} onPress={onRequestClose}>
        <Image source={closeIcon} />
      </TouchableOpacity>
    )}
    <View style={styles.title}>
      {icon !== null && <Image source={icon} style={styles.icon} />}
      <Text style={styles.titleText}>{title}</Text>
    </View>
    <View style={styles.body}>
      <Text style={styles.messageText}>{message}</Text>
    </View>
    {buttonTitle !== undefined && action !== undefined && (
      <Button onPress={action} title={buttonTitle} style={styles.button} />
    )}
  </View>
)

export default WarningBanner

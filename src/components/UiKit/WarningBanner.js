// @flow

import React from 'react'
import {View, TouchableOpacity, Image} from 'react-native'

import {Text, Button} from '.'
import closeIcon from '../../assets/img/close.png'

import styles from './styles/WarningBanner.style'

type Props = {|
  title: string,
  icon: ?number,
  message: string,
  buttonTitle?: ?string,
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
      {icon !== null && <Image source={icon} width={18} style={styles.icon} />}
      <Text style={styles.titleText}>{title}</Text>
    </View>
    <View style={styles.body}>
      <Text style={styles.messageText}>{message}</Text>
    </View>
    {buttonTitle !== null &&
      action !== undefined && <Button onPress={action} title={title} />}
  </View>
)

export default WarningBanner

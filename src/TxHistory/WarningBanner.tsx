import React from 'react'
import {Image, ImageSourcePropType, StyleSheet, TouchableOpacity, View, ViewStyle} from 'react-native'

import closeIcon from '../assets/img/close.png'
import {Button, Text} from '../components'
import {COLORS} from '../theme'
type Props = {
  title: string
  icon?: ImageSourcePropType
  message: string
  buttonTitle?: string
  action?: (event?: unknown) => void
  showCloseIcon?: boolean
  onRequestClose?: () => void
  style?: ViewStyle
}

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
    <View style={styles.title}>
      {icon && <Image source={icon} style={styles.icon} />}
      <Text style={styles.titleText}>{title}</Text>
    </View>
    <View style={styles.body}>
      <Text style={styles.messageText}>{message}</Text>
    </View>
    {buttonTitle !== undefined && action !== undefined && (
      <Button onPress={action} title={buttonTitle} style={styles.button} />
    )}
    {showCloseIcon === true && (
      <TouchableOpacity style={styles.close} onPress={onRequestClose}>
        <Image source={closeIcon} />
      </TouchableOpacity>
    )}
  </View>
)

const styles = StyleSheet.create({
  title: {
    marginVertical: 10,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  titleText: {
    color: COLORS.LIGHT_POSITIVE_GREEN,
    lineHeight: 19,
    fontSize: 16,
  },
  icon: {
    marginRight: 10,
    width: 18,
  },
  messageText: {
    color: '#353535',
    lineHeight: 22,
    fontSize: 14,
  },
  wrapper: {
    marginTop: 24,
    marginHorizontal: 16,
    elevation: 1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 12,
    shadowOpacity: 0.06,
    shadowColor: 'black',
    backgroundColor: '#F1FDFA',
    borderRadius: 8,
  },
  close: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 16,
  },
  body: {
    marginVertical: 10,
    marginHorizontal: 16,
  },
  button: {
    marginHorizontal: 50,
    marginVertical: 16,
  },
})

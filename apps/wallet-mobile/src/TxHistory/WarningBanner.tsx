import {useTheme} from '@yoroi/theme'
import React from 'react'
import {Image, ImageSourcePropType, StyleSheet, TouchableOpacity, View, ViewStyle} from 'react-native'

import {Button, Icon, Text} from '../components'
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
}: Props) => {
  const styles = useStyles()

  return (
    <View style={[styles.wrapper, style]}>
      <View style={styles.title}>
        {icon != null && <Image source={icon} style={styles.icon} />}

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
          <Icon.Cross size={22} color={COLORS.GRAY} />
        </TouchableOpacity>
      )}
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    title: {
      marginVertical: 10,
      justifyContent: 'center',
      flexDirection: 'row',
    },
    titleText: {
      color: color.gray_c500,
      ...atoms.body_1_lg_regular,
    },
    icon: {
      marginRight: 10,
      width: 18,
    },
    messageText: {
      color: color.gray_c900,
      ...atoms.body_2_md_regular,
    },
    wrapper: {
      marginTop: 24,
      marginHorizontal: 16,
      elevation: 1,
      shadowOffset: {width: 0, height: 2},
      shadowRadius: 12,
      shadowOpacity: 0.06,
      shadowColor: color.black_static,
      backgroundColor: color.primary_c100,
      borderRadius: 8,
    },
    close: {
      position: 'absolute',
      top: 0,
      right: 0,
      ...atoms.p_sm,
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
  return styles
}

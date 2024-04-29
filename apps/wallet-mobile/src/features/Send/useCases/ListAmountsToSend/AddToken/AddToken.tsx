import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleProp, StyleSheet, Text, TouchableOpacity, ViewStyle} from 'react-native'

import {Icon, Spacer} from '../../../../../components'

type AddTokenButtonProps = {
  onPress(): void
  disabled?: boolean
  style?: StyleProp<ViewStyle>
}
export const AddTokenButton = ({onPress, disabled, style}: AddTokenButtonProps) => {
  const strings = useStrings()
  const {styles, colors} = useStyles()

  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} testID="addTokenButton" style={[style, styles.button]}>
      <Icon.Plus size={26} color={colors.iconColor} />

      <Spacer width={4} />

      <Text style={styles.label}>{strings.addToken.toLocaleUpperCase()}</Text>
    </TouchableOpacity>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const {color, typography, padding} = theme
  const styles = StyleSheet.create({
    label: {
      color: color.primary_c600,
      ...typography['button-2-m'],
    },
    button: {
      borderColor: color.primary_c600,
      borderRadius: 8,
      flexDirection: 'row',
      ...atoms.px_lg,
      ...atoms.py_xs,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
    },
  })
  const colors = {
    iconColor: color.primary_c600,
  }
  return {styles, colors}
}

const messages = defineMessages({
  addToken: {
    id: 'components.send.addToken',
    defaultMessage: '!!!Add token',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    addToken: intl.formatMessage(messages.addToken),
  }
}

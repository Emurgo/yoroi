import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from 'react-native'

import {Icon} from '../Icon'
import {Spacer} from '../Space/Space'

type AddTokenButtonProps = {
  onPress(): void
  disabled?: boolean
  style?: StyleProp<ViewStyle>
}
export const AddTokenButton = ({
  onPress,
  disabled,
  style,
}: AddTokenButtonProps) => {
  const strings = useStrings()
  const {color} = useTheme()

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      testID="addTokenButton"
      style={[
        style,
        styles.button,
        {borderColor: color.primary_600},
        {backgroundColor: 'transparent'},
      ]}
    >
      <Icon.Plus size={26} color={color.primary_600} />

      <Spacer width={4} />

      <Text style={[styles.label, {color: color.primary_600}]}>
        {strings.addToken.toLocaleUpperCase()}
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  label: {
    ...a.button_2_md,
    textTransform: 'none',
  },
  button: {
    borderRadius: 8,
    flexDirection: 'row',
    ...a.px_lg,
    ...a.py_xs,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
})

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

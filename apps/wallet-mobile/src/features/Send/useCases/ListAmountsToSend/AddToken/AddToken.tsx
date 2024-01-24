import * as React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleProp, StyleSheet, Text, TouchableOpacity, ViewStyle} from 'react-native'

import {Icon, Spacer} from '../../../../../components'
import {COLORS} from '../../../../../theme'

type AddTokenButtonProps = {
  onPress(): void
  disabled?: boolean
  style?: StyleProp<ViewStyle>
}
export const AddTokenButton = ({onPress, disabled, style}: AddTokenButtonProps) => {
  const strings = useStrings()

  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} testID="addTokenButton" style={[style, styles.button]}>
      <Icon.Plus size={26} color={COLORS.SHELLEY_BLUE} />

      <Spacer width={4} />

      <Text style={styles.label}>{strings.addToken.toLocaleUpperCase()}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  label: {
    color: COLORS.SHELLEY_BLUE,
    fontFamily: 'Rubik-Medium',
    fontWeight: '500',
  },
  button: {
    borderRadius: 8,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: COLORS.SHELLEY_BLUE,
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

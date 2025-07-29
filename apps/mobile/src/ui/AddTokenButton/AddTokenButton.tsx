import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleProp, Text, TouchableOpacity, ViewStyle} from 'react-native'

import {Icon} from '~/ui/Icon'
import {Space} from '~/ui/Space/Space'

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
  const {palette: p} = useTheme()

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      testID="addTokenButton"
      style={[
        style,
        {
          borderRadius: 8,
          flexDirection: 'row',
          ...a.px_lg,
          ...a.py_xs,
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 2,
          borderColor: p.primary_600,
          backgroundColor: 'transparent',
        },
      ]}
    >
      <Icon.Plus size={26} color={p.primary_600} />

      <Space.Width.xs />

      <Text
        style={[a.button_2_md, {color: p.primary_600, textTransform: 'none'}]}
      >
        {strings.addToken.toLocaleUpperCase()}
      </Text>
    </TouchableOpacity>
  )
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

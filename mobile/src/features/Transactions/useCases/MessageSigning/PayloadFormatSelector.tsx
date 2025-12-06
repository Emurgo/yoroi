import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Button, ButtonType} from '~/ui/Button/Button'

type PayloadFormat = 'text' | 'json' | 'hex'

type Props = {
  value: PayloadFormat
  onChange: (format: PayloadFormat) => void
  onErrorChange?: (error: string | null) => void
}

export const PayloadFormatSelector = ({
  value,
  onChange,
  onErrorChange,
}: Props) => {
  const strings = useStrings()
  const {palette: p} = useTheme()

  const handleChange = React.useCallback(
    (format: PayloadFormat) => {
      onChange(format)
      onErrorChange?.(null)
    },
    [onChange, onErrorChange],
  )

  return (
    <View style={[a.flex_row, a.gap_2xs]}>
      <Button
        onPress={() => handleChange('text')}
        type={ButtonType.SecondaryText}
        title={
          strings.transactions.messageSigning.messageSigningPayloadFormatText
        }
        size="M"
        fontOverride={a.body_1_lg_medium}
        {...(value === 'text' && {
          style: [{backgroundColor: p.gray_100}],
        })}
      />
      <Button
        onPress={() => handleChange('json')}
        type={ButtonType.SecondaryText}
        title={
          strings.transactions.messageSigning.messageSigningPayloadFormatJson
        }
        size="M"
        fontOverride={a.body_1_lg_medium}
        {...(value === 'json' && {
          style: [{backgroundColor: p.gray_100}],
        })}
      />
      <Button
        onPress={() => handleChange('hex')}
        type={ButtonType.SecondaryText}
        title={
          strings.transactions.messageSigning.messageSigningPayloadFormatHex
        }
        size="M"
        fontOverride={a.body_1_lg_medium}
        {...(value === 'hex' && {
          style: [{backgroundColor: p.gray_100}],
        })}
      />
    </View>
  )
}

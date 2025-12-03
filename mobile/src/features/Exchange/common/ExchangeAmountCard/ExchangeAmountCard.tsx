import {amountFormatter} from '@yoroi/portfolio'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'

import * as React from 'react'
import {Pressable, Text, TextInput, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Space} from '~/ui/Space/Space'
import {TokenInfoIcon} from '~/ui/TokenInfoIcon/TokenInfoIcon'
import {isEmptyString} from '@yoroi/cardano-wallet/utils/string'

type ExchangeAmountCardProps = {
  error?: string
  label?: string
  inputRef?: React.RefObject<TextInput>
  onChange(value: string): void
  value?: string
  inputEditable?: boolean
  touched?: boolean
  amount: Portfolio.Token.Amount
  testID?: string
}

export const ExchangeAmountCard: React.FC<ExchangeAmountCardProps> = ({
  error,
  label,
  inputRef,
  onChange,
  value,
  inputEditable,
  touched,
  amount,
  testID,
}: ExchangeAmountCardProps) => {
  const [isFocused, setIsFocused] = React.useState(false)

  const formattedAmount = amountFormatter()(amount)

  const focusInput = () => {
    if (inputRef?.current) {
      inputRef.current.focus()
    }
  }

  const {atoms: ta, palette: p, isDark} = useTheme()

  const strings = useStrings()

  return (
    <View>
      <View
        style={[
          a.rounded_sm,
          a.border,
          a.p_lg,
          {
            height: 86,
            borderColor: p.gray_400,
          },
          isFocused && {
            borderWidth: 2,
            borderColor: p.gray_900,
          },
          !isEmptyString(error) && {
            borderColor: p.sys_magenta_500,
            borderWidth: 2,
          },
        ]}
      >
        {label != null && (
          <Text
            style={[
              a.absolute,
              a.px_xs,
              ta.bg_color_max,
              ta.text_gray_medium,
              {
                top: -7,
                left: 10,
                fontSize: 12,
              },
              !isEmptyString(error) && ta.text_error,
            ]}
          >
            {label}
          </Text>
        )}

        <View
          style={[
            a.flex,
            a.flex_row,
            a.justify_between,
            a.align_start,
            {
              height: 64,
            },
          ]}
        >
          <Pressable style={a.flex_1} onPress={focusInput}>
            <TextInput
              keyboardType="numeric"
              autoComplete="off"
              value={value}
              placeholder="0"
              placeholderTextColor={p.gray_600}
              onChangeText={onChange}
              allowFontScaling
              selectionColor={isFocused ? p.input_selected : p.gray_900}
              style={[
                a.py_0,
                ta.text_gray_max,
                {
                  minWidth: 120,
                  maxWidth: 200,
                  height: 34,
                  fontSize: 16,
                },
                value === '0' && ta.text_gray_low,
              ]}
              underlineColorAndroid="transparent"
              ref={inputRef}
              editable={inputEditable && touched}
              selectTextOnFocus
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              keyboardAppearance={isDark ? 'dark' : 'light'}
              testID={testID}
            />
          </Pressable>

          <Space.Width.sm />

          <View style={[a.flex_col, a.justify_between, a.h_full]}>
            <View style={[a.flex_row, a.self_end, a.align_center]}>
              <TokenInfoIcon info={amount.info} size="sm" />

              <Space.Width.sm />

              <Text
                style={[
                  a.body_1_lg_regular,
                  ta.text_gray_max,
                  {fontWeight: '400'},
                ]}
              >
                {amount.info.name}
              </Text>
            </View>

            <View style={[a.flex_row, a.self_end, a.align_center]}>
              <Text
                ellipsizeMode="middle"
                style={[a.body_3_sm_regular, ta.text_gray_low]}
              >{`${strings.exchange.currentBalance}: ${formattedAmount}`}</Text>
            </View>
          </View>
        </View>
      </View>

      {!isEmptyString(error) ? (
        <View>
          <Space.Height._2xs />

          <Text style={[a.body_3_sm_regular, ta.text_error]}>{error}</Text>
        </View>
      ) : (
        <Space.Height.lg />
      )}
    </View>
  )
}

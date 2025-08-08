import {amountFormatter} from '@yoroi/portfolio'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import * as React from 'react'
import {Pressable, Text, TextInput, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Space} from '~/ui/Space/Space'
import {TokenInfoIcon} from '~/ui/TokenInfoIcon/TokenInfoIcon'
import {isEmptyString} from '~/wallets/utils/string'

type AmountCardProps = {
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

export const AmountCard: React.FC<AmountCardProps> = ({
  error,
  label,
  inputRef,
  onChange,
  value,
  inputEditable,
  touched,
  amount,
  testID,
}: AmountCardProps) => {
  const [isFocused, setIsFocused] = React.useState(false)

  const formattedAmount = amountFormatter()(amount)

  const focusInput = () => {
    if (inputRef?.current) {
      inputRef.current.focus()
    }
  }

  const {palette: p, isDark} = useTheme()

  const strings = useStrings()

  return (
    <View>
      <View
        style={[
          {
            borderRadius: 8,
            borderWidth: 1,
            borderColor: p.gray_400,
            paddingTop: 16,
            paddingBottom: 16,
            paddingLeft: 16,
            paddingRight: 16,
            padding: 10,
            height: 86,
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
              {
                position: 'absolute',
                top: -7,
                left: 10,
                backgroundColor: p.bg_color_max,
                paddingHorizontal: 5,
                fontSize: 12,
                color: p.gray_900,
              },
              !isEmptyString(error) && {color: p.sys_magenta_500},
            ]}
          >
            {label}
          </Text>
        )}

        <View
          style={[
            {
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              height: 64,
            },
          ]}
        >
          <Pressable style={[{flex: 1}]} onPress={() => focusInput()}>
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
                {
                  paddingVertical: 0,
                  minWidth: 120,
                  maxWidth: 200,
                  height: 34,
                  fontSize: 16,
                  color: p.gray_max,
                },
                value === '0' && {color: p.gray_600},
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

          <View
            style={[{flexDirection: 'column', justifyContent: 'flex-start'}]}
          >
            <View
              style={[
                {
                  flexDirection: 'row',
                  alignSelf: 'flex-end',
                  alignItems: 'center',
                },
              ]}
            >
              <TokenInfoIcon info={amount.info} size="sm" />

              <Space.Width.sm />

              <Text
                style={[
                  a.body_1_lg_regular,
                  {fontWeight: '400', color: p.gray_max},
                ]}
              >
                {amount.info.name}
              </Text>
            </View>

            <Space.Width.sm />

            <View
              style={[
                {
                  flexDirection: 'row',
                  alignSelf: 'flex-end',
                  alignItems: 'center',
                },
              ]}
            >
              <Text
                ellipsizeMode="middle"
                style={[a.body_3_sm_regular, {color: p.gray_600}]}
              >{`${strings.exchange.currentBalance}: ${formattedAmount}`}</Text>
            </View>
          </View>
        </View>
      </View>

      {!isEmptyString(error) ? (
        <View>
          <Space.Height._2xs />

          <Text style={[{color: p.sys_magenta_500}, a.body_3_sm_regular]}>
            {error}
          </Text>
        </View>
      ) : (
        <Space.Height.lg />
      )}
    </View>
  )
}

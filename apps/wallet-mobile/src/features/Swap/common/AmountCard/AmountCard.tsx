import {useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Pressable, StyleSheet, Text, TextInput, View} from 'react-native'
import {TouchableOpacity} from 'react-native-gesture-handler'

import {Icon, Spacer} from '../../../../components'
import {isEmptyString} from '../../../../kernel/utils'
import {YoroiWallet} from '../../../../yoroi-wallets/cardano/types'
import {formatTokenWithText} from '../../../../yoroi-wallets/utils/format'
import {TokenInfoIcon} from '../../../Portfolio/common/TokenAmountItem/TokenInfoIcon'

type Props = {
  label?: string
  wallet: YoroiWallet
  amount?: Partial<Portfolio.Token.Amount>
  onChange(value: string): void
  value?: string
  navigateTo?: () => void
  touched?: boolean
  inputRef?: React.RefObject<TextInput>
  inputEditable?: boolean
  error?: string
  testId?: string
}

export const AmountCard = ({
  label,
  onChange,
  value,
  amount,
  navigateTo,
  touched,
  inputRef,
  inputEditable = true,
  error,
  testId,
}: Props) => {
  const [isFocused, setIsFocused] = React.useState(false)
  const strings = useStrings()
  const {styles, colors} = useStyles()
  const {isDark} = useTheme()

  const noTokenSelected = !touched
  const info = amount?.info
  const name = info?.ticker ?? info?.name ?? ''
  const formattedAmount = !info ? '0' : formatTokenWithText(amount?.quantity ?? 0n, info, 18)

  const focusInput = () => {
    if (inputRef?.current) {
      inputRef.current.focus()
    }
  }

  return (
    <View>
      <View style={[styles.container, isFocused && styles.active, !isEmptyString(error) && styles.borderError]}>
        {label != null && <Text style={[styles.label, !isEmptyString(error) && styles.labelError]}>{label}</Text>}

        <View style={styles.content}>
          <Pressable
            style={styles.amountWrapper}
            onPress={() => (!info ? navigateTo?.() : focusInput())}
            testID={`${testId}-token-input`}
          >
            <TextInput
              keyboardType="numeric"
              autoComplete="off"
              value={value}
              placeholder="0"
              placeholderTextColor={colors.placeholder}
              onChangeText={onChange}
              allowFontScaling
              selectionColor={isFocused ? colors.focused : colors.blur}
              style={[styles.amountInput, value === '0' && styles.grayText]}
              underlineColorAndroid="transparent"
              ref={inputRef}
              editable={inputEditable && touched}
              selectTextOnFocus
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              testID={`${testId}-amount-input`}
              keyboardAppearance={isDark ? 'dark' : 'light'} // ios feature
              {...(!info && {onPressIn: navigateTo})}
            />
          </Pressable>

          <Spacer width={7} />

          <View>
            <TouchableOpacity onPress={navigateTo}>
              <View style={styles.sectionContainer}>
                {!info || (info.nature !== Portfolio.Token.Nature.Primary && info.originalImage === '') ? (
                  <View style={styles.notSelected}>
                    <Icon.Coins size={20} color={colors.noSelected} />
                  </View>
                ) : (
                  <TokenInfoIcon info={info} size="sm" />
                )}

                <Spacer width={8} />

                <Text style={styles.coinName}>{noTokenSelected || !info ? strings.selectToken : name}</Text>

                <Spacer width={8} />

                <Icon.Chevron direction="down" size={24} color={colors.gray} />
              </View>
            </TouchableOpacity>

            <Spacer width={8} />

            <View style={styles.sectionContainer}>
              <Text
                ellipsizeMode="middle"
                style={styles.balanceText}
              >{`${strings.currentBalance}: ${formattedAmount}`}</Text>
            </View>
          </View>
        </View>
      </View>

      {!isEmptyString(error) && (
        <View>
          <Spacer height={4} />

          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  )
}

const messages = defineMessages({
  selectToken: {
    id: 'swap.swapScreen.selectToken',
    defaultMessage: '!!!Select token',
  },
  currentBalance: {
    id: 'swap.swapScreen.currentBalance',
    defaultMessage: '!!!Current Balance',
  },
})

const useStrings = () => {
  const intl = useIntl()
  return {
    selectToken: intl.formatMessage(messages.selectToken),
    currentBalance: intl.formatMessage(messages.currentBalance),
  }
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    container: {
      borderRadius: 8,
      borderWidth: 1,
      borderColor: color.gray_400,
      ...atoms.p_lg,
      height: 86,
    },
    borderError: {
      borderColor: color.sys_magenta_500,
      borderWidth: 2,
    },
    active: {
      borderWidth: 2,
      borderColor: color.gray_900,
    },
    label: {
      ...atoms.absolute,
      top: -7,
      left: 10,
      backgroundColor: color.bg_color_max,
      paddingHorizontal: 5,
      fontSize: 12,
      color: color.gray_900,
    },
    labelError: {
      color: color.sys_magenta_500,
    },
    content: {
      ...atoms.flex_row,
      ...atoms.justify_between,
      height: 64,
    },
    amountInput: {
      ...atoms.py_0,
      minWidth: 120,
      maxWidth: 200,
      height: 34,
      fontSize: 16,
      color: color.gray_max,
    },
    amountWrapper: {
      ...atoms.flex_1,
    },
    sectionContainer: {
      ...atoms.flex_row,
      ...atoms.align_center,
      alignSelf: 'flex-end',
    },
    coinName: {
      ...atoms.body_1_lg_regular,
      color: color.gray_max,
    },
    balanceText: {
      fontSize: 12,
      color: color.gray_600,
    },
    errorText: {
      color: color.sys_magenta_500,
      fontSize: 12,
    },
    grayText: {
      color: color.gray_600,
    },
    notSelected: {
      backgroundColor: color.gray_100,
      borderRadius: 4,
      ...atoms.p_xs,
    },
  })

  const colors = {
    placeholder: color.gray_600,
    focused: color.gray_900,
    blur: color.black_static,
    noSelected: color.gray_400,
    gray: color.gray_max,
  }
  return {styles, colors} as const
}

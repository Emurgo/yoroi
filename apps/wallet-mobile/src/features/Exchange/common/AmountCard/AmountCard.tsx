import {amountFormatter} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import * as React from 'react'
import {Pressable, StyleSheet, Text, TextInput, View} from 'react-native'

import {Boundary} from '../../../../components/Boundary/Boundary'
import {Spacer} from '../../../../components/Spacer/Spacer'
import {isEmptyString} from '../../../../kernel/utils'
import {TokenIconPlaceholder, TokenInfoIcon} from '../../../Portfolio/common/TokenAmountItem/TokenInfoIcon'
import {useStrings} from '../useStrings'

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

  const fallback = React.useCallback(() => <TokenIconPlaceholder />, [])

  const {styles, colors} = useStyles()

  const {isDark} = useTheme()

  const strings = useStrings()

  return (
    <View>
      <View style={[styles.container, isFocused && styles.active, !isEmptyString(error) && styles.borderError]}>
        {label != null && <Text style={[styles.label, !isEmptyString(error) && styles.labelError]}>{label}</Text>}

        <View style={styles.content}>
          <Pressable style={styles.amountWrapper} onPress={() => focusInput()}>
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
              keyboardAppearance={isDark ? 'dark' : 'light'}
              testID={testID}
            />
          </Pressable>

          <Spacer width={7} />

          <View style={styles.rightSection}>
            <View style={styles.sectionContainer}>
              <Boundary loading={{fallback: <TokenIconPlaceholder />}} error={{fallback}}>
                <TokenInfoIcon info={amount.info} size="sm" />
              </Boundary>

              <Spacer width={8} />

              <Text style={styles.coinName}>{amount.info.name}</Text>
            </View>

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

      {!isEmptyString(error) ? (
        <View>
          <Spacer height={4} />

          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <Spacer height={22} />
      )}
    </View>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    container: {
      borderRadius: 8,
      borderWidth: 1,
      borderColor: color.gray_400,
      paddingTop: 16,
      paddingBottom: 16,
      paddingLeft: 16,
      paddingRight: 16,
      padding: 10,
      height: 86,
    },
    active: {
      borderWidth: 2,
      borderColor: color.gray_900,
    },
    borderError: {
      borderColor: color.sys_magenta_500,
      borderWidth: 2,
    },
    label: {
      position: 'absolute',
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
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      height: 64,
    },
    amountWrapper: {
      flex: 1,
    },
    amountInput: {
      paddingVertical: 0,
      minWidth: 120,
      maxWidth: 200,
      height: 34,
      fontSize: 16,
      color: color.gray_max,
    },
    grayText: {
      color: color.gray_600,
    },
    rightSection: {
      flexDirection: 'column',
      justifyContent: 'flex-start',
    },
    sectionContainer: {
      flexDirection: 'row',
      alignSelf: 'flex-end',
      alignItems: 'center',
    },
    coinName: {
      ...atoms.body_1_lg_regular,
      fontWeight: '400',
      color: color.gray_max,
    },
    balanceText: {
      ...atoms.body_3_sm_regular,
      color: color.gray_600,
    },
    errorText: {
      color: color.sys_magenta_500,
      ...atoms.body_3_sm_regular,
    },
  })
  const colors = {
    placeholder: color.gray_600,
    focused: color.gray_600,
    blur: color.gray_900,
  }
  return {styles, colors} as const
}

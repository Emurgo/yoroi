import {Balance} from '@yoroi/types'
import * as React from 'react'
import {Pressable, StyleSheet, Text, TextInput, View} from 'react-native'

import {Boundary, Spacer, TokenIcon, TokenIconPlaceholder} from '../../../../components'
import {formatTokenWithText} from '../../../../legacy/format'
import {useTheme} from '../../../../theme'
import {Theme} from '../../../../theme/types'
import {isEmptyString} from '../../../../utils'
import {YoroiWallet} from '../../../../yoroi-wallets/cardano/types'
import {useTokenInfo} from '../../../../yoroi-wallets/hooks'
import {useStrings} from '../useStrings'

type AmountCardProps = {
  error?: string
  label?: string
  inputRef?: React.RefObject<TextInput>
  onChange(value: string): void
  value?: string
  inputEditable?: boolean
  touched?: boolean
  amount: Balance.Amount
  wallet: YoroiWallet
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
  wallet,
}: AmountCardProps) => {
  const [isFocused, setIsFocused] = React.useState(false)

  const {quantity, tokenId} = amount
  const tokenInfo = useTokenInfo({wallet, tokenId})

  const name = tokenInfo.ticker ?? tokenInfo.name
  const formattedAmount = formatTokenWithText(quantity, tokenInfo, 18)

  const focusInput = () => {
    if (inputRef?.current) {
      inputRef.current.focus()
    }
  }

  const fallback = React.useCallback(() => <TokenIconPlaceholder />, [])

  const {theme} = useTheme()

  const styles = React.useMemo(() => getStyles({theme: theme}), [theme])

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
              placeholderTextColor={theme.color.gray[600]}
              onChangeText={onChange}
              allowFontScaling
              selectionColor={isFocused ? theme.color.gray[900] : theme.color['black-static']}
              style={[styles.amountInput, value === '0' && styles.grayText]}
              underlineColorAndroid="transparent"
              ref={inputRef}
              editable={inputEditable && touched}
              selectTextOnFocus
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
          </Pressable>

          <Spacer width={7} />

          <View style={styles.rightSection}>
            <View style={styles.sectionContainer}>
              <Boundary loading={{fallback: <TokenIconPlaceholder />}} error={{fallback}}>
                <TokenIcon wallet={wallet} tokenId={tokenInfo.id} variant="swap" />
              </Boundary>

              <Spacer width={8} />

              <Text style={styles.coinName}>{name}</Text>
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

      {!isEmptyString(error) && (
        <View>
          <Spacer height={4} />

          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  )
}

const getStyles = (props: {theme: Theme}) => {
  const {theme} = props
  const styles = StyleSheet.create({
    container: {
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.color.gray[400],
      paddingTop: 16,
      paddingBottom: 16,
      paddingLeft: 16,
      paddingRight: 16,
      padding: 10,
      height: 86,
    },
    active: {
      borderWidth: 2,
      borderColor: theme.color.gray[900],
    },
    borderError: {
      borderColor: theme.color.magenta[500],
      borderWidth: 2,
    },
    label: {
      position: 'absolute',
      top: -7,
      left: 10,
      backgroundColor: theme.color['white-static'],
      paddingHorizontal: 5,
      fontSize: 12,
      color: theme.color.gray[900],
    },
    labelError: {
      color: theme.color.magenta[500],
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
      color: theme.color['black-static'],
    },
    grayText: {
      color: theme.color.gray[600],
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
      fontSize: 16,
      fontWeight: '400',
    },
    balanceText: {
      fontSize: 12,
      color: theme.color.gray[600],
    },
    errorText: {
      color: theme.color.magenta[500],
      fontSize: 12,
    },
  })
  return styles
}

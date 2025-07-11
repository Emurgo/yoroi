import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, TextInput, View} from 'react-native'

import {undefinedToken} from '../../common/constants'
import {useStrings} from '../../common/strings'
import {useSwap} from '../../common/SwapProvider'

const BORDER_SIZE = 1

export const LimitInput = () => {
  const strings = useStrings()
  const [isFocused, setIsFocused] = React.useState(false)
  const {color} = useTheme()
  const {isDark} = useTheme()

  const swapForm = useSwap()
  const tokenInInfo = swapForm.tokenInfos.get(
    swapForm.tokenInInput.tokenId ?? undefinedToken,
  )
  const disabled = swapForm.orderType === 'market'

  const tokenInTicker = tokenInInfo?.ticker ?? tokenInInfo?.name ?? '-'

  return (
    <>
      <View
        style={[
          styles.container,
          {borderColor: color.bg_color_min},
          disabled && styles.disabled,
          disabled && {backgroundColor: color.gray_50},
          isFocused && styles.active,
          isFocused && {borderColor: color.gray_900},
        ]}
      >
        <Text
          style={[
            styles.label,
            {backgroundColor: color.bg_color_max, color: color.gray_900},
          ]}
        >
          {strings.limitPrice}
        </Text>

        <View style={styles.content}>
          <TextInput
            keyboardType="numeric"
            autoComplete="off"
            value={swapForm.wantedPrice}
            placeholder="0"
            placeholderTextColor={color.gray_600}
            onChangeText={(value) =>
              swapForm.action({type: 'WantedPriceInputChanged', value})
            }
            allowFontScaling
            selectionColor={color.input_selected}
            style={[styles.amountInput, {color: color.gray_max}]}
            underlineColorAndroid="transparent"
            editable={!disabled}
            ref={swapForm.wantedPriceInputRef}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            keyboardAppearance={isDark ? 'dark' : 'light'} // ios feature
          />

          <View style={[styles.textWrapper, disabled && styles.disabled]}>
            <Text style={[styles.text, {color: color.gray_max}]}>
              {tokenInTicker}
            </Text>
          </View>
        </View>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    borderWidth: BORDER_SIZE,
    width: '100%',
    height: 56,
    paddingLeft: 16,
    paddingRight: 8,
  },
  disabled: {},
  active: {
    zIndex: 2222,
  },
  label: {
    position: 'absolute',
    top: -7,
    left: 10,
    paddingHorizontal: 5,
    fontSize: 12,
  },
  content: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'relative',
  },
  amountInput: {
    fontSize: 16,
    height: 56,
    paddingRight: 16,
  },
  text: {
    fontSize: 16,
    fontFamily: 'Rubik-Regular',
  },
  textWrapper: {
    position: 'absolute',
    top: 0,
    right: 8,
    paddingLeft: 8,
    height: 56 - BORDER_SIZE * 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
})

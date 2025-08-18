import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Text, TextInput, View} from 'react-native'

import {undefinedToken} from '~/features/Swap/common/constants'
import {useSwap} from '~/features/Swap/common/useSwap'
import {useStrings} from '~/kernel/i18n/useStrings'

export const LimitInput = () => {
  const strings = useStrings()
  const [isFocused, setIsFocused] = React.useState(false)
  const {palette: p, atoms: ta, isDark} = useTheme()

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
          a.rounded_sm,
          a.w_full,
          a.pl_lg,
          a.pr_sm,
          a.border,
          {
            height: 56,
            borderColor: p.bg_color_min,
          },
          disabled && {backgroundColor: p.gray_50},
          isFocused && {zIndex: 2222, borderColor: p.gray_900},
        ]}
      >
        <Text
          style={[
            a.absolute,
            ta.bg_color_max,
            {
              top: -7,
              left: 10,
              paddingHorizontal: 5,
              fontSize: 12,
              color: p.gray_900,
            },
          ]}
        >
          {strings.swap.limitPrice}
        </Text>

        <View style={[a.flex_row, a.flex, a.justify_between, a.relative]}>
          <TextInput
            keyboardType="numeric"
            autoComplete="off"
            value={swapForm.wantedPrice}
            placeholder="0"
            placeholderTextColor={p.gray_600}
            onChangeText={(value) =>
              swapForm.action({type: 'WantedPriceInputChanged', value})
            }
            allowFontScaling
            selectionColor={p.input_selected}
            style={[
              {
                fontSize: 16,
                height: 56,
                paddingRight: 16,
                color: p.gray_max,
              },
            ]}
            underlineColorAndroid="transparent"
            editable={!disabled}
            ref={swapForm.wantedPriceInputRef}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            keyboardAppearance={isDark ? 'dark' : 'light'} // ios feature
          />

          <View
            style={[
              a.flex,
              a.align_center,
              a.justify_center,
              a.pl_sm,
              a.absolute,
              {
                top: 0,
                right: 8,
                height: 56 - 1 * 2,
              },
            ]}
          >
            <Text
              style={[
                {
                  fontSize: 16,
                  fontFamily: 'Rubik-Regular',
                  color: p.gray_max,
                },
              ]}
            >
              {tokenInTicker}
            </Text>
          </View>
        </View>
      </View>
    </>
  )
}

import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Text, TextInput, View} from 'react-native'

import {undefinedToken} from '~/features/Swap/common/constants'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useSwap} from '~/features/Swap/common/useSwap'

const BORDER_SIZE = 1

export const LimitInput = () => {
  const strings = useStrings()
  const [isFocused, setIsFocused] = React.useState(false)
  const {palette: p} = useTheme()
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
          {
            borderRadius: 8,
            borderWidth: BORDER_SIZE,
            width: '100%',
            height: 56,
            paddingLeft: 16,
            paddingRight: 8,
            borderColor: p.bg_color_min,
          },
          disabled && {backgroundColor: p.gray_50},
          isFocused && {zIndex: 2222, borderColor: p.gray_900},
        ]}
      >
        <Text
          style={[
            {
              position: 'absolute',
              top: -7,
              left: 10,
              paddingHorizontal: 5,
              fontSize: 12,
              backgroundColor: p.bg_color_max,
              color: p.gray_900,
            },
          ]}
        >
          {strings.limitPrice}
        </Text>

        <View
          style={[
            {
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              position: 'relative',
            },
          ]}
        >
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
              {
                position: 'absolute',
                top: 0,
                right: 8,
                paddingLeft: 8,
                height: 56 - BORDER_SIZE * 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
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

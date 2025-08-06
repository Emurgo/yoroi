import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Platform, Pressable, Text, TextInput, View} from 'react-native'

import {useSwap} from '~/features/Swap/common/useSwap'
import {Icon} from '~/ui/Icon'
import {PairedBalance} from '../PairedBalance/PairedBalance'
import {TokenInfoIcon} from '../TokenInfoIcon/TokenInfoIcon'

export const AmountCard = ({direction}: {direction: 'in' | 'out'}) => {
  const {atoms: ta, palette: p} = useTheme()
  const swapForm = useSwap()
  const [isFocused, setIsFocused] = React.useState(false)

  const amount =
    direction === 'in' ? swapForm.tokenInInput : swapForm.tokenOutInput
  const info = amount.info
  const quantity = amount.quantity
  const error = amount.error
  const touched = amount.touched

  const formattedAmount = info ? `${info.name} (${info.ticker})` : ''

  const focusInput = () => {
    // Focus logic here
  }

  const navigateTo = () => {
    // Navigation logic here
  }

  return (
    <View
      style={[
        {borderRadius: 8},
        {borderRadius: 8},
        a.p_lg,
        a.gap_lg,
        {backgroundColor: p.bg_color_min},
      ]}
    >
      <View style={[a.flex_row, a.justify_between]}>
        <View style={[a.flex_row, a.align_center]}>
          <TokenInfoIcon info={info} size="md" />

          <Text
            style={[
              a.pr_xs,
              a.pl_md,
              a.body_1_lg_medium,
              {color: p.text_gray_medium},
            ]}
          >
            {info?.name ?? 'Select Token'}
          </Text>

          <Icon.Chevron direction="down" size={24} color={p.gray_max} />
        </View>

        <Pressable
          style={[a.flex_1, a.flex_row, a.justify_end, a.align_center]}
          onPress={() => (info ? focusInput() : navigateTo())}
        >
          <TextInput
            keyboardType="numeric"
            autoComplete="off"
            value={quantity}
            placeholder="0"
            placeholderTextColor={p.text_gray_medium}
            onChangeText={(value) => {
              // onChange logic here
            }}
            allowFontScaling
            selectionColor={isFocused ? p.input_selected : p.black_static}
            style={[
              a.py_0,
              a.heading_3_medium,
              a.text_right,
              {color: p.gray_900},
              Platform.OS === 'ios' ? {lineHeight: 22} : {},
            ]}
            underlineColorAndroid="transparent"
            editable={touched}
            selectTextOnFocus
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        </Pressable>
      </View>

      {error ? (
        <View>
          <Icon.Portfolio2 size={15} color={p.sys_magenta_500} />

          <Text style={[a.body_2_md_regular, {color: p.sys_magenta_500}]}>
            {error}
          </Text>
        </View>
      ) : (
        <View style={[a.flex_row, a.align_center, a.gap_sm]}>
          <Icon.Portfolio2 size={15} color={p.text_gray_medium} />

          <Text
            ellipsizeMode="middle"
            style={[a.body_2_md_regular, {color: p.gray_600}]}
          >
            {formattedAmount}
          </Text>
        </View>
      )}

      {info && (
        <PairedBalance
          amount={{
            info,
            quantity,
          }}
        />
      )}
    </View>
  )
}

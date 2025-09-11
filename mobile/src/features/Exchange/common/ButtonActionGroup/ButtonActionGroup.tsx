import {OrderType} from '@yoroi/exchange'
import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Text, TouchableOpacity, View} from 'react-native'

type ButtonActionGroupProps = {
  onSelect: (orderType: OrderType) => void
  selected: OrderType
  labels: ReadonlyArray<{label: string; value: OrderType}>
  disabled?: boolean
}

export const ButtonActionGroup = ({
  labels,
  onSelect,
  selected,
  disabled,
}: ButtonActionGroupProps) => {
  const handleOnPress = (orderType: OrderType) => onSelect(orderType)
  const {atoms: ta, palette: p} = useTheme()

  return (
    <View style={a.flex_row}>
      {labels.map((labelItem) => (
        <View key={labelItem.value} style={a.pr_sm}>
          <TouchableOpacity
            disabled={disabled}
            onPress={() => handleOnPress(labelItem.value)}
            style={[
              a.px_sm,
              a.py_sm,
              a.rounded_sm,
              labelItem.value === selected && {backgroundColor: p.gray_200},
            ]}
          >
            <Text style={[a.body_1_lg_medium, ta.text_gray_max]}>
              {labelItem.label}
            </Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  )
}

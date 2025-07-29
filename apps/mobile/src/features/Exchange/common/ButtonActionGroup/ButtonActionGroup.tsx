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
    <View style={[a.flex_row]}>
      {labels.map((labelItem) => (
        <View key={labelItem.value} style={[{paddingRight: 8}]}>
          <TouchableOpacity
            disabled={disabled}
            onPress={() => handleOnPress(labelItem.value)}
            style={[
              {paddingHorizontal: 8, paddingVertical: 8, borderRadius: 8},
              labelItem.value === selected && {backgroundColor: p.gray_200},
            ]}
          >
            <Text style={[a.body_1_lg_medium, {color: p.gray_max}]}>
              {labelItem.label}
            </Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  )
}

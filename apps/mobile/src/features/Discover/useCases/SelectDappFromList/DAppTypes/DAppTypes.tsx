import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {ScrollView, Text, TouchableWithoutFeedback, View} from 'react-native'
import {useMappedStrings} from '~/kernel/i18n/useStrings'

import {Icon} from '~/ui/Icon'
import {Space} from '~/ui/Space/Space'

type Props = {
  types: string[]
  onToggle: (category: string) => void
  selectedTypes: string[]
}
export const DAppTypes = ({types, onToggle, selectedTypes}: Props) => {
  const scrollViewRef = React.useRef<ScrollView | null>(null)
  const sorted = React.useMemo(
    () => sortTypes(types, selectedTypes),
    [types, selectedTypes],
  )

  return (
    <ScrollView
      ref={scrollViewRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[a.pb_lg]}
    >
      {sorted.map((type) => {
        const isSelected = selectedTypes.includes(type)
        return (
          <TypeItem
            key={type}
            isActive={isSelected}
            name={type}
            onToggle={() => {
              scrollViewRef.current?.scrollTo({
                x: 0,
                animated: true,
              })
              onToggle(type)
            }}
          />
        )
      })}

      <Space.Width.sm />
    </ScrollView>
  )
}

const sortTypes = (types: string[], selectedTypes: string[]) => {
  return types
    .sort((firstType, secondType) => firstType.localeCompare(secondType))
    .sort(
      (firstType, secondType) =>
        selectedTypes.indexOf(secondType) - selectedTypes.indexOf(firstType),
    )
}

type TypeItemProps = {
  isActive: boolean
  name: string
  onToggle: () => void
  disabled?: boolean
  isLimited?: boolean
}
const TypeItem = ({
  name,
  isActive = false,
  onToggle,
  disabled = false,
  isLimited = false,
}: TypeItemProps) => {
  const {palette: p} = useTheme()

  const [isPressed, setIsPressed] = React.useState(false)
  const mappedStrings = useMappedStrings()
  const text = React.useMemo(
    () => mappedStrings(name) ?? name,
    [mappedStrings, name],
  )

  const getBoxChipStyle = React.useMemo(() => {
    if (disabled)
      return {borderWidth: 2, borderRadius: 4, borderColor: p.el_primary_min}
    if (isLimited) return {backgroundColor: p.el_secondary}

    if (isActive && isPressed) return {backgroundColor: p.primary_600}
    if (isActive && !isPressed) return {backgroundColor: p.primary_500}

    if (isPressed)
      return {
        borderWidth: 2,
        borderColor: p.el_primary_max,
        backgroundColor: p.primary_100,
      }

    return {borderWidth: 2, borderColor: p.el_primary_medium}
  }, [p, disabled, isActive, isLimited, isPressed])

  const getTextChipStyle = React.useMemo(() => {
    if (disabled) return {color: p.primary_300}
    if (isLimited) return {color: p.black_static}
    if (isActive) return {color: p.white_static}

    if (isPressed) return {color: p.text_primary_max}

    return {color: p.text_primary_medium}
  }, [p, disabled, isActive, isLimited, isPressed])

  const handlePress = (isPressIn: boolean) => {
    setIsPressed(isPressIn)
  }

  return (
    <View style={[{marginRight: 8}]}>
      <TouchableWithoutFeedback
        onPressIn={() => handlePress(true)}
        onPress={onToggle}
        onPressOut={() => handlePress(false)}
      >
        <View
          style={[
            {
              borderRadius: 8,
              height: 40,
              paddingHorizontal: 14,
              backgroundColor: p.bg_color_max,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            },
            a.p_2xs,
            getBoxChipStyle,
          ]}
        >
          {isActive && <Icon.CheckFilled2 color={getTextChipStyle.color} />}

          <Text style={[a.body_1_lg_regular, getTextChipStyle]}>{text}</Text>
        </View>
      </TouchableWithoutFeedback>
    </View>
  )
}

import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {useMemo} from 'react'
import {ScrollView, StyleSheet, Text, TouchableWithoutFeedback, View} from 'react-native'

import {Icon, Spacer} from '../../../../../components'

type Props = {
  types: string[]
  onToggle: (category: string) => void
  selectedTypes: string[]
}
export const DAppTypes = ({types, onToggle, selectedTypes}: Props) => {
  const {styles} = useStyles()
  const sorted = useMemo(() => sortTypes(types, selectedTypes), [types, selectedTypes])

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.contentContainer}>
      {sorted.map((type) => {
        const isSelected = selectedTypes.includes(type)
        return <TypeItem key={type} isActive={isSelected} name={type} onToggle={() => onToggle(type)} />
      })}

      <Spacer width={8} />
    </ScrollView>
  )
}

const sortTypes = (types: string[], selectedTypes: string[]) => {
  return types
    .sort((firstType, secondType) => firstType.localeCompare(secondType))
    .sort((firstType, secondType) => selectedTypes.indexOf(secondType) - selectedTypes.indexOf(firstType))
}

type TypeItemProps = {
  isActive: boolean
  name: string
  onToggle: () => void
  disabled?: boolean
  isLimited?: boolean
}
const TypeItem = ({name, isActive = false, onToggle, disabled = false, isLimited = false}: TypeItemProps) => {
  const {styles} = useStyles()

  const [isPressed, setIsPressed] = React.useState(false)

  const getBoxChipStyle = useMemo(() => {
    if (disabled) return styles.boxDisabledStyle
    if (isLimited) return styles.boxLimitedStyle

    if (isActive && isPressed) return styles.boxActivePressedStyle
    if (isActive && !isPressed) return styles.boxActiveNonPressedStyle

    if (isPressed) return styles.boxPressedStyle

    return styles.boxIdleStyle
  }, [styles, disabled, isActive, isLimited, isPressed])

  const getTextChipStyle = useMemo(() => {
    if (disabled) return styles.textDisabledStyle
    if (isLimited) return styles.textLimitedStyle
    if (isActive) return styles.textActiveStyle

    if (isPressed) return styles.textPressedStyle

    return styles.textIdleStyle
  }, [disabled, isActive, isLimited, isPressed, styles])

  const handlePress = (isPressIn: boolean) => {
    setIsPressed(isPressIn)
  }

  return (
    <View style={styles.chip}>
      <TouchableWithoutFeedback
        onPressIn={() => handlePress(true)}
        onPress={onToggle}
        onPressOut={() => handlePress(false)}
      >
        <View style={[styles.chipContentBox, getBoxChipStyle]}>
          {isActive && <Icon.CheckFilled2 color={getTextChipStyle.color} />}

          <Text style={[styles.chipText, getTextChipStyle]}>{name}</Text>
        </View>
      </TouchableWithoutFeedback>
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()

  const styles = StyleSheet.create({
    chip: {
      marginRight: 8,
    },
    chipContentBox: {
      borderRadius: 8,
      ...atoms.p_2xs,
      height: 40,
      paddingHorizontal: 14,
      backgroundColor: color.bg_color_high,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    chipText: {
      color: color.primary_c600,
      ...atoms.body_1_lg_regular,
    },
    contentContainer: {
      ...atoms.pl_lg,
      ...atoms.pb_lg,
    },
    boxDisabledStyle: {
      borderWidth: 2,
      ...atoms.rounded_sm,
      borderColor: color.el_primary_low,
    },
    textDisabledStyle: {
      color: color.primary_c300,
    },
    boxIdleStyle: {
      borderWidth: 2,
      borderColor: color.el_primary_medium,
    },
    textIdleStyle: {
      color: color.text_primary_medium,
    },
    boxLimitedStyle: {
      backgroundColor: color.el_secondary_medium,
    },
    textLimitedStyle: {
      color: color.black_static,
    },
    boxActivePressedStyle: {
      backgroundColor: color.primary_c600,
    },
    boxActiveNonPressedStyle: {
      backgroundColor: color.primary_c500,
    },
    textActiveStyle: {
      color: color.white_static,
    },
    boxPressedStyle: {
      borderWidth: 2,
      borderColor: color.el_primary_high,
      backgroundColor: color.primary_c100,
    },
    textPressedStyle: {
      color: color.text_primary_high,
    },
  })

  return {styles} as const
}

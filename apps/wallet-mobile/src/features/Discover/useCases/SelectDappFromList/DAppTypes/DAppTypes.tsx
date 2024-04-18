import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {ScrollView, StyleSheet, Text, TouchableWithoutFeedback, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {Icon, Spacer} from '../../../../../components'
import {DAppCategory, TDAppCategory} from '../../../common/DAppMock'

type Props = {
  types: TDAppCategory[]
  onToggle: (category: TDAppCategory) => void
  selected?: Partial<{[key in TDAppCategory]: boolean}>
  listCategoriesSelected: TDAppCategory[]
  disabled?: boolean
  isLimited?: boolean
}
export const DAppTypes = ({types, onToggle, selected, listCategoriesSelected}: Props) => {
  const {styles} = useStyles()

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.contentContainer}>
      {types
        .sort((firstType, secondType) => firstType.localeCompare(secondType))
        .sort(
          (firstType, secondType) =>
            listCategoriesSelected.indexOf(secondType) - listCategoriesSelected.indexOf(firstType),
        )
        .map((type) => {
          const isSelected = !!(selected ?? {})[type]
          return <TypeItem key={type} isActive={isSelected} name={DAppCategory[type]} onToggle={() => onToggle(type)} />
        })}

      <Spacer width={8} />
    </ScrollView>
  )
}

type TypeItemProps = {
  isActive: boolean
  name: string
  onToggle: () => void
  disabled?: boolean
  isLimited?: boolean
}
const TypeItem = ({name, isActive = false, onToggle, disabled = false, isLimited = false}: TypeItemProps) => {
  const {styles, colors} = useStyles()

  const [isPressed, setIsPressed] = React.useState(false)

  const getBoxGradientBg = () => {
    if (disabled) return colors.gradientDisabledColor
    if (isLimited) return colors.gradientLimited

    if (isActive && isPressed) return colors.gradientColorPressed
    if (isActive && !isPressed) return colors.gradientColorSelected

    if (isPressed) return colors.gradientGreenBlue

    return colors.gradientIdle
  }

  const getBoxContentBg = () => {
    if (disabled) return styles.chipBgWhite
    if (isActive) return styles.bgTransparent

    return styles.chipBgWhite
  }

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
        <LinearGradient style={styles.gradient} start={{x: 0, y: 0}} end={{x: 1, y: 1}} colors={getBoxGradientBg()}>
          <View style={[styles.chipContentBox, getBoxContentBg()]}>
            {isActive && <Icon.CheckFilled2 fill={colors.iconCheckFilledColor} color={colors.whiteStatic} />}

            <Text style={styles.chipText}>{name}</Text>
          </View>
        </LinearGradient>
      </TouchableWithoutFeedback>
    </View>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const {color, padding, typography} = theme

  const styles = StyleSheet.create({
    gradient: {
      opacity: 1,
      borderRadius: 8,
      ...padding['xxs'],
      overflow: 'hidden',
      height: 40,
    },
    chip: {
      marginRight: 8,
    },
    bgTransparent: {
      backgroundColor: 'transparent',
    },
    chipContentBox: {
      paddingHorizontal: 14,
      backgroundColor: color.white_static,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      borderRadius: 6,
      height: '100%',
    },
    chipBgWhite: {
      backgroundColor: color.white_static,
    },
    chipText: {
      color: color.primary_c600,
      ...atoms.body_1_lg_regular,
    },
    contentContainer: {
      ...atoms.pl_lg,
      ...atoms.pb_lg,
    },
  })

  const colors = {
    gradientColorSelected: color.gradients['blue-green'],
    gradientColorPressed: ['#C4CFF5', '#93F5E1'],
    iconCheckFilledColor: color.primary_c600,
    gradientDisabledColor: [color.primary_c200, '#C4CFF5'],
    gradientGreenBlue: color.bg_gradient_1,
    gradientLimited: ['#93F5E1', '#C6F7ED'],
    gradientIdle: ['#E4E8F7', '#C6F7ED'],
    whiteStatic: color.white_static,
  }
  return {styles, colors} as const
}

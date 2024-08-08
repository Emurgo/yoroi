import {isNumber} from '@yoroi/common'
import {useTheme} from '@yoroi/theme'
import React, {type ReactNode} from 'react'
import {Image, StyleSheet, TextStyle, TouchableOpacity, TouchableOpacityProps, View, ViewStyle} from 'react-native'
import Animated, {FadeInDown, FadeOutDown, Layout} from 'react-native-reanimated'

import {Text} from '../Text'

export type ButtonProps = TouchableOpacityProps & {
  title: string
  outline?: boolean
  outlineOnLight?: boolean
  containerStyle?: ViewStyle
  block?: boolean
  iconImage?: number | ReactNode
  withoutBackground?: boolean
  shelleyTheme?: boolean
  mainTheme?: boolean
  outlineShelley?: boolean
  textStyles?: TextStyle
  isCopying?: boolean
  copiedText?: string
  testId?: string
  startContent?: ReactNode
  endContent?: ReactNode
}

export const Button = (props: ButtonProps) => {
  const {
    onPress,
    title,
    block,
    style,
    containerStyle,
    outline,
    outlineOnLight,
    iconImage,
    withoutBackground,
    shelleyTheme,
    mainTheme,
    outlineShelley,
    textStyles,
    isCopying,
    copiedText,
    testId,
    startContent,
    endContent,
    ...rest
  } = props

  const {styles} = useStyles()

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[block && styles.block, containerStyle]}
      activeOpacity={0.5}
      testID={testId}
      {...rest}
    >
      {isCopying && (
        <Animated.View layout={Layout} entering={FadeInDown} exiting={FadeOutDown} style={styles.isCopying}>
          <Text style={styles.copiedText}>{copiedText}</Text>
        </Animated.View>
      )}

      <View
        style={[
          styles.button,
          outline && styles.buttonOutline,
          outlineOnLight && styles.buttonOutlineOnLight,
          props.disabled && styles.buttonDisabled,
          withoutBackground && styles.buttonTransparent,
          outlineShelley && styles.buttonOutlineShelley,
          shelleyTheme && styles.shelleyTheme,
          mainTheme && styles.mainTheme,
          outlineOnLight && shelleyTheme && styles.shelleyOutlineOnLight,
          style,
        ]}
      >
        {isNumber(iconImage) ? <Image source={iconImage} /> : React.isValidElement(iconImage) ? iconImage : null}

        {startContent != null ? startContent : null}

        <Text
          style={[
            styles.text,
            outlineOnLight && styles.textOutlineOnLight,
            outlineOnLight && shelleyTheme && styles.textShelleyOutlineOnLight,
            outlineShelley && styles.textOutlineShelley,
            textStyles,
          ]}
        >
          {title}
        </Text>

        {endContent != null ? endContent : null}
      </View>
    </TouchableOpacity>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()

  const buttonOutline = {
    borderWidth: 2,
    borderColor: color.gray_cmin,
    backgroundColor: 'transparent',
  }
  const styles = StyleSheet.create({
    block: {
      flex: 1,
    },
    button: {
      backgroundColor: color.secondary_c500,
      minHeight: 48,
      maxHeight: 54,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonTransparent: {
      backgroundColor: 'transparent',
    },
    buttonOutline: {
      ...buttonOutline,
    },
    mainTheme: {
      backgroundColor: color.primary_c500,
    },
    buttonOutlineOnLight: {
      ...buttonOutline,
      borderColor: color.secondary_c500,
    },
    buttonOutlineShelley: {
      ...buttonOutline,
      borderColor: color.el_primary_medium,
    },
    text: {
      color: color.white_static,
      ...atoms.body_2_md_medium,
      ...atoms.p_sm,
      textAlign: 'center',
      textTransform: 'uppercase',
    },
    textOutlineOnLight: {
      color: color.secondary_c500,
    },
    textOutlineShelley: {
      color: color.text_primary_medium,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    shelleyTheme: {
      backgroundColor: color.primary_c500,
    },
    shelleyOutlineOnLight: {
      backgroundColor: 'transparent',
      borderColor: color.primary_c600,
      borderWidth: 2,
    },
    textShelleyOutlineOnLight: {
      color: color.primary_c600,
      fontWeight: '600',
    },
    isCopying: {
      position: 'absolute',
      backgroundColor: color.gray_cmax,
      alignItems: 'center',
      justifyContent: 'center',
      top: -50,
      alignSelf: 'center',
      borderRadius: 4,
      zIndex: 10,
    },
    copiedText: {
      color: color.gray_cmin,
      textAlign: 'center',
      ...atoms.p_sm,
      ...atoms.body_2_md_medium,
    },
  })

  return {styles} as const
}

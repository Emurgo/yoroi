// @flow

import React from 'react'
import {StyleSheet, TouchableOpacity, View, Image} from 'react-native'
import {colors} from '../../styles/config'
import Text from './Text'

const buttonOutline = {
  borderWidth: 1,
  borderColor: '#fff',
  backgroundColor: 'transparent',
}

const styles = StyleSheet.create({
  block: {
    flex: 1,
  },
  button: {
    backgroundColor: colors.buttonBackground,
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
  buttonOutlineOnLight: {
    ...buttonOutline,
    borderColor: colors.buttonBackground,
  },
  buttonOutlineShelley: {
    ...buttonOutline,
    borderColor: colors.buttonBackgroundBlue,
  },
  text: {
    color: 'white',
    textAlign: 'center',
    padding: 8,
    fontSize: 14,
  },
  textOutlineOnLight: {
    color: colors.buttonBackground,
  },
  textOutlineShelley: {
    color: colors.buttonBackgroundBlue,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  shelleyTheme: {
    backgroundColor: colors.buttonBackgroundBlue,
  },
  shelleyOutlineOnLight: {
    backgroundColor: 'transparent',
    borderColor: colors.buttonBackgroundBlue,
    borderWidth: 2,
  },
  textShelleyOutlineOnLight: {
    color: colors.buttonBackgroundBlue,
    fontWeight: '600',
  },
})

type ButtonProps = {
  title: string,
  onPress: (event?: any) => mixed,
  color?: ?string,
  accessibilityLabel?: ?string,
  disabled?: ?boolean,
  outline?: boolean,
  outlineOnLight?: boolean,
  style?: Object,
  containerStyle?: Object,
  block?: boolean,
  iconImage?: number,
  withoutBackground?: boolean,
  shelleyTheme?: boolean,
  outlineShelley?: boolean,
  testID?: string,
}

class Button extends React.Component<ButtonProps> {
  render() {
    const {
      accessibilityLabel,
      onPress,
      title,
      disabled,
      block,
      style,
      containerStyle,
      outline,
      outlineOnLight,
      iconImage,
      withoutBackground,
      shelleyTheme,
      outlineShelley,
      testID,
    } = this.props

    const formattedTitle = title && title.toUpperCase()

    return (
      <TouchableOpacity
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        disabled={disabled}
        onPress={onPress}
        style={[block === true && styles.block, containerStyle]}
        activeOpacity={0.5}
        testID={testID}
      >
        <View
          style={[
            styles.button,
            outline === true && styles.buttonOutline,
            outlineOnLight === true && styles.buttonOutlineOnLight,
            disabled === true && styles.buttonDisabled,
            withoutBackground === true && styles.buttonTransparent,
            outlineShelley === true && styles.buttonOutlineShelley,
            shelleyTheme === true && styles.shelleyTheme,
            outlineOnLight === true &&
              shelleyTheme === true &&
              styles.shelleyOutlineOnLight,
            style,
          ]}
        >
          {iconImage != null && <Image source={iconImage} />}
          <Text
            style={[
              styles.text,
              outlineOnLight === true && styles.textOutlineOnLight,
              outlineOnLight === true &&
                shelleyTheme === true &&
                styles.textShelleyOutlineOnLight,
              outlineShelley === true && styles.textOutlineShelley,
            ]}
          >
            {formattedTitle}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }
}

export default Button

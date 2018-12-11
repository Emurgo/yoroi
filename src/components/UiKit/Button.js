// @flow

import React from 'react'
import {StyleSheet, TouchableOpacity, View, Image} from 'react-native'
import {colors} from '../../styles/config'
import Text from './Text'

const styles = StyleSheet.create({
  block: {
    flex: 1,
  },
  button: {
    backgroundColor: colors.buttonBackground,
    height: 48,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonTransparent: {
    backgroundColor: 'transparent',
  },
  buttonOutline: {
    borderWidth: 1,
    borderColor: '#fff',
    backgroundColor: 'transparent',
  },
  buttonOutlineOnLight: {
    borderWidth: 1,
    borderColor: colors.buttonBackground,
    backgroundColor: 'transparent',
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
  buttonDisabled: {
    opacity: 0.5,
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
    } = this.props

    const formattedTitle = title && title.toUpperCase()

    return (
      <TouchableOpacity
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        disabled={disabled}
        onPress={onPress}
        style={[block && styles.block, containerStyle]}
        activeOpacity={0.5}
      >
        <View
          style={[
            styles.button,
            outline && styles.buttonOutline,
            outlineOnLight && styles.buttonOutlineOnLight,
            disabled && styles.buttonDisabled,
            withoutBackground && styles.buttonTransparent,
            style,
          ]}
        >
          {iconImage && <Image source={iconImage} />}
          <Text
            style={[styles.text, outlineOnLight && styles.textOutlineOnLight]}
          >
            {formattedTitle}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }
}

export default Button

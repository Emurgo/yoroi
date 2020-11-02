// @flow

// TODO(navigation): delete component?

import React from 'react'
import {StyleSheet, TouchableOpacity, View, Image} from 'react-native'
import {COLORS} from '../../styles/config'
import Text from '../UiKit/Text'

const styles = StyleSheet.create({
  block: {
    flex: 1,
  },
  button: {
    backgroundColor: 'transparent',
    minHeight: 48,
    maxHeight: 54,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: COLORS.LIGHT_POSITIVE_GREEN,
    textAlign: 'center',
    padding: 8,
    fontSize: 10,
    lineHeight: 18,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
})

type ButtonProps = {
  title: string,
  onPress: (event?: any) => mixed,
  accessibilityLabel?: ?string,
  disabled?: ?boolean,
  style?: Object,
  containerStyle?: Object,
  iconStyle?: Object,
  block?: boolean,
  iconImage?: number,
  testID?: string,
}

class NavButton extends React.Component<ButtonProps> {
  render() {
    const {
      accessibilityLabel,
      onPress,
      title,
      disabled,
      block,
      style,
      containerStyle,
      iconStyle,
      iconImage,
      testID,
    } = this.props

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
            disabled === true && styles.buttonDisabled,
            style,
          ]}
        >
          {iconImage != null && <Image source={iconImage} style={iconStyle} />}
          <Text style={[styles.text]}>{title}</Text>
        </View>
      </TouchableOpacity>
    )
  }
}

export default NavButton

// @flow

import React from 'react'
import {
  Platform,
  StyleSheet,
  TouchableNativeFeedback,
  TouchableOpacity,
  View,
} from 'react-native'
import {colors} from '../../styles/config'
import Text from './Text'

const styles = StyleSheet.create({
  block: {
    flex: 1,
  },
  button: {
    backgroundColor: colors.buttonBackground,
    height: 56,
    borderRadius: 8,
    justifyContent: 'center',
  },
  text: {
    color: 'white',
    textAlign: 'center',
    padding: 8,
  },
  buttonDisabled: {
    backgroundColor: '#dfdfdf',
  },
  textDisabled: {
    color: '#cdcdcd',
  },
})

type ButtonProps = {
  title: string,
  onPress: (event?: any) => mixed,
  color?: ?string,
  accessibilityLabel?: ?string,
  disabled?: ?boolean,
  style?: Object,
  block?: boolean,
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
    } = this.props

    const formattedTitle = title.toUpperCase()
    const Touchable =
      Platform.OS === 'android' ? TouchableNativeFeedback : TouchableOpacity

    return (
      <Touchable
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        disabled={disabled}
        onPress={onPress}
        style={[block && styles.block]}
      >
        <View style={[styles.button, disabled && styles.buttonDisabled, style]}>
          <Text
            style={[styles.text, disabled && styles.textDisabled]}
            disabled={disabled}
          >
            {formattedTitle}
          </Text>
        </View>
      </Touchable>
    )
  }
}

export default Button

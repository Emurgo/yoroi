// @flow

import React from 'react'
import type {Node} from 'react'
import {StyleSheet, Text as RNText, Platform} from 'react-native'
import type {TextStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet'

import stylesConfig, {COLORS} from '../../styles/config'

const styles = StyleSheet.create({
  text: {
    fontFamily: stylesConfig.defaultFont,
    color: COLORS.BLACK,
    lineHeight: 18,
    fontSize: 14,
  },
  secondary: {
    color: COLORS.SECONDARY_TEXT,
  },
  small: {
    fontSize: 12,
    lineHeight: 16,
  },
  light: {
    color: '#fff',
  },
  error: {
    color: '#FF1351',
  },
  bold: {
    fontFamily: stylesConfig.bold,
  },
  monospace: {
    ...Platform.select({
      ios: {fontFamily: 'Menlo'},
      android: {fontFamily: 'monospace'},
    }),
  },
})

type Props = {
  children: Node,
  small?: boolean,
  secondary?: boolean,
  light?: boolean,
  style?: TextStyleProp,
  bold?: boolean,
  monospace?: boolean,
  error?: boolean,
  adjustsFontSizeToFit?: boolean,
}

type State = {
  fontSize: number,
}

const androidAdjustsFontSizeToFitFix = (width, childrenLength) => {
  return Math.floor(1.4 * (width / childrenLength))
}

class Text extends React.Component<Props, State> {
  state = {
    fontSize: 0,
  }

  render() {
    const {
      small,
      secondary,
      light,
      bold,
      monospace,
      error,
      style,
      children,
      adjustsFontSizeToFit,
      ...restProps
    } = this.props

    const textStyle = [
      styles.text,
      small === true && styles.small,
      secondary === true && styles.secondary,
      light === true && styles.light,
      bold === true && styles.bold,
      monospace === true && styles.monospace,
      error === true && styles.error,
      style,
    ]
    if (this.state.fontSize) {
      textStyle.push({fontSize: this.state.fontSize})
    }

    if (adjustsFontSizeToFit != null && Platform.OS === 'ios') {
      return (
        <RNText {...restProps} style={textStyle}>
          {children}
        </RNText>
      )
    } else {
      // workaround which fixes adjustsFontSizeToFit at android
      // based on
      // https://github.com/facebook/react-native/issues/20906
      return (
        <RNText
          {...restProps}
          onLayout={(event) => {
            if (adjustsFontSizeToFit == null || typeof children !== 'string') {
              return
            }
            const {width} = event.nativeEvent.layout
            const fixedFontSize = androidAdjustsFontSizeToFitFix(
              width,
              children.length,
            )
            const styleFontSize: any =
              style != null && style.fontSize != null && style.fontSize
            const fontSize = styleFontSize
              ? Math.min(styleFontSize, fixedFontSize)
              : fixedFontSize

            this.setState({fontSize})
          }}
          style={textStyle}
        >
          {children}
        </RNText>
      )
    }
  }
}

export default Text

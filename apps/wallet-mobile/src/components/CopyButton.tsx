import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle} from 'react-native'
import Animated, {FadeInDown, FadeOutDown, Layout} from 'react-native-reanimated'

import {Text} from '../../../wallet-mobile/src/components'
import {Icon} from '../components/Icon'
import {useStrings} from '../features/Receive/common/useStrings'
import {useCopy} from '../legacy/useCopy'

export type CopyButtonProps = {
  value: string
  onCopy?: () => void
  children?: React.ReactNode
  style?: StyleProp<ViewStyle>
}

export const CopyButton = ({value, onCopy, children, style}: CopyButtonProps) => {
  const [isCopying, copy] = useCopy()

  return (
    <AnimatedCopyButton
      style={style}
      isCopying={isCopying}
      onCopy={() => {
        copy(value)
        onCopy?.()
      }}
    >
      {children}
    </AnimatedCopyButton>
  )
}

const AnimatedCopyButton = ({
  onCopy,
  children,
  style,
  isCopying,
}: Omit<CopyButtonProps, 'value'> & {isCopying: boolean}) => {
  const strings = useStrings()
  const {styles, colors} = useStyles()

  return (
    <TouchableOpacity onPress={onCopy} disabled={isCopying} testID="copyButton" style={style}>
      {isCopying ? (
        <View style={styles.rowContainer}>
          <Animated.View layout={Layout} entering={FadeInDown} exiting={FadeOutDown} style={styles.isCopying}>
            <Text style={styles.copiedText}>{strings.addressCopiedMsg}</Text>
          </Animated.View>

          <Icon.CopySuccess size={26} color={colors.gray} />
        </View>
      ) : (
        <Icon.Copy size={26} color={colors.gray} />
      )}

      {children}
    </TouchableOpacity>
  )
}


export const AnimatedCopyButtonWithMessage = ({
  onCopy,
  children,
  style,
  isCopying,
}: Omit<CopyButtonProps, 'value'> & {isCopying: boolean}) => {
  const strings = useStrings()
  const {styles, colors} = useStyles()

  return (
    <TouchableOpacity onPress={onCopy} disabled={isCopying} testID="copyButton" style={style}>
      {isCopying ? (
        <View style={styles.rowContainer}>
          <Animated.View layout={Layout} entering={FadeInDown} exiting={FadeOutDown} style={styles.isCopying}>
            <Text style={styles.copiedText}>{strings.addressCopiedMsg}</Text>
          </Animated.View>

          <Icon.CopySuccess size={26} color={colors.gray} />
        </View>
      ) : (
        <Icon.Copy size={26} color={colors.gray} />
      )}

      {children}
    </TouchableOpacity>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const {color, typography} = theme

  const colors = {
    gray: color.gray[900],
  }

  const styles = StyleSheet.create({
    isCopying: {
      position: 'absolute',
      backgroundColor: color.gray.max,
      alignItems: 'center',
      justifyContent: 'center',
      bottom: 20,
      right: 10,
      alignSelf: 'center',
      borderRadius: 4,
      zIndex: 10,
    },
    copiedText: {
      color: color.gray.min,
      textAlign: 'center',
      padding: 8,
      flex: 1,
      ...typography['body-2-m-medium'],
    },
    rowContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  })

  return {styles, colors} as const
}

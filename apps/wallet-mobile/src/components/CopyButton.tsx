import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle} from 'react-native'
import Animated, {FadeInDown, FadeOutDown, Layout} from 'react-native-reanimated'

import {Text} from '../../../wallet-mobile/src/components'
import {isEmptyString} from '../../../wallet-mobile/src/utils/utils'
import {Icon} from '../components/Icon'
import {useCopy} from '../legacy/useCopy'

export type CopyButtonProps = {
  value: string
  onCopy?: () => void
  children?: React.ReactNode
  style?: StyleProp<ViewStyle>
  message?: string
}

export const CopyButton = ({value, onCopy, children, style, message}: CopyButtonProps) => {
  const [isCopying, copy] = useCopy()

  return (
    <AnimatedCopyButton
      style={style}
      isCopying={isCopying}
      message={message}
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
  message,
}: Omit<CopyButtonProps, 'value'> & {isCopying: boolean; message?: string}) => {
  const {styles, colors} = useStyles()

  return (
    <TouchableOpacity onPress={onCopy} disabled={isCopying} testID="copyButton" style={style}>
      {isCopying ? (
        <View style={styles.rowContainer}>
          {!isEmptyString(message) ? (
            <Animated.View layout={Layout} entering={FadeInDown} exiting={FadeOutDown} style={styles.isCopying}>
              <Text style={styles.copiedText}>{message}</Text>
            </Animated.View>
          ) : (
            <View />
          )}

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
  const {color, atoms} = useTheme()

  const colors = {
    gray: color.gray_c900,
  }

  const styles = StyleSheet.create({
    isCopying: {
      position: 'absolute',
      backgroundColor: color.gray_cmax,
      alignItems: 'center',
      justifyContent: 'center',
      bottom: 20,
      right: 10,
      alignSelf: 'center',
      borderRadius: 4,
      zIndex: 10,
    },
    copiedText: {
      color: color.gray_cmin,
      textAlign: 'center',
      padding: 8,
      flex: 1,
      ...atoms.body_2_md_medium,
    },
    rowContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  })

  return {styles, colors} as const
}

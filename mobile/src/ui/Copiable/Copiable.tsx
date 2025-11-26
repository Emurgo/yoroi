import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Text, TouchableOpacity, View, ViewStyle} from 'react-native'

import {useCopy} from '~/features/Copy/context/CopyProvider'
import {Icon} from '~/ui/Icon'

type CopiableProps = {
  text: string
  title?: string
  children?: React.ReactNode
  style?: ViewStyle
  feedback?: string
  onCopy?: () => void
  onPress?: () => void
}

export const Copiable = ({
  children,
  style,
  text,
  title,
  feedback,
  onCopy,
  onPress,
}: CopiableProps) => {
  const {palette: p} = useTheme()
  const {isCopying, copy} = useCopy()
  const CopyIcon = isCopying ? Icon.CopySuccess : Icon.Copy

  return (
    <View style={[a.flex_row, a.justify_between, a.gap_xs, style]}>
      {title !== undefined && (
        <View style={a.flex_1}>
          <Text
            style={[
              a.body_2_md_regular,
              {
                color: p.el_gray_max,
              },
            ]}
          >
            {title}
          </Text>
        </View>
      )}

      {onPress ? (
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.5}
          style={[a.flex_1, a.flex_row, a.justify_center, a.gap_xs]}
        >
          {children}
        </TouchableOpacity>
      ) : (
        children
      )}

      <TouchableOpacity
        onPress={(event) => {
          copy({text, event, feedback})
          onCopy?.()
        }}
        activeOpacity={0.5}
      >
        <CopyIcon size={25} color={p.gray_900} />
      </TouchableOpacity>
    </View>
  )
}

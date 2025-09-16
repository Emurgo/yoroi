import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Text} from '~/ui/Text/Text'

type SafeAreaModalWrapperProps = React.PropsWithChildren<{
  title?: string
  footer?: React.ReactNode
  edges?: ('top' | 'bottom' | 'left' | 'right')[]
}>

export const SafeAreaModalWrapper = ({
  title,
  footer,
  edges = ['left', 'right', 'bottom'],
  children,
}: SafeAreaModalWrapperProps) => {
  const {atoms: ta} = useTheme()

  return (
    <SafeAreaView edges={edges} style={[a.flex_1, ta.bg_color_max]}>
      {title && (
        <View style={[a.py_sm, a.px_lg]}>
          <Text style={[a.heading_3_medium, ta.text_gray_max, a.text_center]}>
            {title}
          </Text>
        </View>
      )}

      <View style={[a.flex_1, a.justify_between]}>
        {children}

        {footer && <View style={[a.py_lg, a.px_lg]}>{footer}</View>}
      </View>
    </SafeAreaView>
  )
}

import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {View} from 'react-native'
import {SharedValue} from 'react-native-reanimated'
import {SafeAreaView, SafeAreaViewProps} from 'react-native-safe-area-context'

import {Space} from '~/ui/Space/Space'
import {Text} from '~/ui/Text/Text'

import {Discard} from '../../shared/Discard'

type Props = SafeAreaViewProps & {
  title?: string
  footer?: React.ReactNode
  dragY: SharedValue<number>
}

export const ModalWrapper = ({
  title,
  footer,
  dragY,
  children,
  edges,
  ...rest
}: Props) => {
  const {atoms: ta} = useTheme()

  return (
    <SafeAreaView
      edges={edges}
      style={[a.justify_between, a.flex_1, a.flex_grow, ta.bg_color_max]}
      {...rest}
    >
      <Discard.Indicator dragY={dragY}>
        {title && (
          <View style={[a.py_sm, a.px_lg]}>
            <Text style={[a.heading_3_medium, ta.text_gray_max, a.text_center]}>
              {title}
            </Text>
          </View>
        )}
      </Discard.Indicator>

      {children}

      {footer && <View style={[a.p_lg, a.align_end]}>{footer}</View>}
      {!footer && <Space.Height.lg />}
    </SafeAreaView>
  )
}
